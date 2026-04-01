'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import clsx from 'clsx';

import { type ExpressionType, TypeID, type Typification } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { TextInput } from '@/components/input';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { promptUnsaved } from '@/utils/utils';

import { type CreateConstituentaDTO, type UpdateConstituentaDTO } from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useRSForm } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { CstType, type RSForm } from '../../models/rsform';
import { canProduceStructure, generateAlias } from '../../models/rsform-api';
import { type SPNode, StructurePlanner } from '../../models/structure-planner';

import { StructureFlow } from './structure-flow';

export interface DlgStructurePlannerProps {
  schemaID: number;
  targetID: number;
}

export function DlgStructurePlanner() {
  const { schemaID, targetID } = useDialogsStore(state => state.props as DlgStructurePlannerProps);
  const { schema } = useRSForm({ itemID: schemaID });
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { createConstituenta } = useCreateConstituenta();
  const { updateConstituenta } = useUpdateConstituenta();

  const target = schema.cstByID.get(targetID) ?? null;
  const items = target ? new StructurePlanner(schema, target).build() : [];

  const [selectedKey, setSelectedKey] = useState(items[0].key ?? '');
  const [term, setTerm] = useState<string>(items[0].existing?.term_raw ?? '');

  if (!target || !canProduceStructure(target) || !target.analysis.type || items.length === 0) {
    console.error('Structure planner error input', target, items);
    hideDialog();
    return null;
  }

  const selectedNode = items.find(node => node.key === selectedKey) ?? items[0];
  const selectedCst = selectedNode?.existing;
  const isDirty = (selectedCst && term !== selectedCst?.term_raw) || (!selectedCst && term !== '');

  function handleSelectNode(nextKey: string) {
    const node = items.find(item => item.key === nextKey);
    if (!node || node.key === selectedNode?.key) {
      return;
    }
    if (isDirty && !promptUnsaved()) {
      return;
    }
    setSelectedKey(node.key);
    setTerm(node.existing?.term_raw ?? '');
  }

  function resetTerm() {
    setTerm(selectedCst?.term_raw ?? '');
  }

  async function saveTerm(node: SPNode): Promise<void> {
    if (node.existing) {
      const data: UpdateConstituentaDTO = {
        target: node.existing.id,
        item_data: { term_raw: term }
      };
      await updateConstituenta({ itemID: schema.id, data });
      return;
    }

    const data: CreateConstituentaDTO = {
      insert_after: target!.id,
      cst_type: inferDraftType(node.type),
      alias: inferAlias(node, schema),
      term_raw: term,
      definition_formal: node.definition,
      definition_raw: '',
      convention: '',
      crucial: false,
      term_forms: []
    };
    const created = await createConstituenta({ itemID: schema.id, data });
    setTerm(created.term_raw);
  }

  return (
    <ModalView className='w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]' fullScreen noFooterButton>
      <div className='flex flex-col h-full'>
        {selectedNode ? (
          <div className='relative flex gap-3 mt-4 px-8 items-center mx-auto'>
            <div className='whitespace-nowrap w-60 truncate text-right font-math mr-3'>
              {selectedNode.definition}
            </div>

            <div className={clsx('font-medium whitespace-nowrap w-8', !selectedCst && 'text-constructive')}>
              {selectedCst?.alias ?? inferAlias(selectedNode, schema)}
            </div>

            <TextInput
              id='dlg_structure_term'
              dense
              label='Термин'
              className='w-140'
              value={term}
              onChange={event => setTerm(event.target.value)}
            />

            <div className='cc-icons'>
              <MiniButton
                title={selectedCst ? 'Обновить термин' : 'Создать конституенту'}
                icon={selectedCst ?
                  <IconSave size='1.25rem' className='icon-primary' /> :
                  <IconNewItem size='1.25rem' className='icon-green' />
                }
                onClick={() => void saveTerm(selectedNode)}
                disabled={!isDirty || term === ''}
              />
              <MiniButton
                title='Reset term'
                icon={<IconReset size='1.25rem' className='icon-primary' />}
                onClick={resetTerm}
                disabled={!isDirty || !selectedCst}
              />
            </div>
          </div>
        ) : null}

        <div className='h-full'>
          <ReactFlowProvider>
            <StructureFlow
              items={items}
              rootType={target.analysis.type as Typification}
              selected={selectedKey}
              setSelected={handleSelectNode}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </ModalView>
  );
}

function inferDraftType(type: ExpressionType): CstType {
  if (type.typeID === TypeID.function) {
    return CstType.FUNCTION;
  }
  return CstType.TERM;
}

function inferAlias(node: SPNode, schema: RSForm) {
  return node.existing?.alias ?? generateAlias(inferDraftType(node.type), schema);
}
