'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { TypeID, type Typification } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { promptUnsaved } from '@/utils/utils';

import { type CreateConstituentaDTO, type UpdateConstituentaDTO } from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useRSForm } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { CstType, type RSForm } from '../../models/rsform';
import { canProduceStructure, generateAlias } from '../../models/rsform-api';
import { buildStructurePlanner, type SPNode } from '../../models/structure-planner';

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
  const nodes = target ? buildStructurePlanner(schema, target) : [];

  const initialNode = nodes[0] ?? null;
  const [selectedKey, setSelectedKey] = useState(initialNode?.key ?? '');
  const [term, setTerm] = useState<string>(initialNode?.existing?.term_raw ?? '');

  if (!target || !canProduceStructure(target) || !target.analysis.type) {
    hideDialog();
    return null;
  }

  const rootType = target.analysis.type as Typification;
  const selected = nodes.find(node => node.key === selectedKey) ?? nodes[0];
  const baseTerm = selected?.existing?.term_raw ?? '';
  const isDirty = !!selected && term !== baseTerm;

  function handleSelectNode(nextKey: string) {
    const node = nodes.find(item => item.key === nextKey);
    if (!node || node.key === selected?.key) {
      return;
    }
    if (isDirty && !promptUnsaved()) {
      return;
    }
    setSelectedKey(node.key);
    setTerm(node.existing?.term_raw ?? '');
  }

  function resetTerm() {
    if (!selected) {
      return;
    }
    setTerm(selected.existing?.term_raw ?? '');
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
        {selected ? (
          <div className='relative flex gap-3 mt-4 px-8 items-center mx-auto'>
            <div className='font-medium whitespace-nowrap w-8'>
              {selected.existing?.alias ?? inferAlias(selected, schema)}
            </div>

            <TextArea
              id='dlg_structure_definition'
              className='cursor-default w-60'
              value={selected.definition}
              fitContent
              dense
              noResize
              noBorder
              noOutline
              transparent
              readOnly
            />

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
                title={selected.existing ? 'Обновить термин' : 'Создать конституенту'}
                icon={selected.existing ?
                  <IconSave size='1.25rem' className='icon-primary' /> :
                  <IconNewItem size='1.25rem' className='icon-green' />
                }
                onClick={() => void saveTerm(selected)}
                disabled={!isDirty}
              />
              <MiniButton
                title='Reset term'
                icon={<IconReset size='1.25rem' className='icon-primary' />}
                onClick={resetTerm}
                disabled={!isDirty}
              />
            </div>
          </div>
        ) : null}

        <div className='h-full'>
          <ReactFlowProvider>
            <StructureFlow
              items={nodes}
              rootType={rootType}
              selected={selected?.key ?? ''}
              setSelected={handleSelectNode}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </ModalView>
  );
}

function inferDraftType(type: Typification): CstType {
  switch (type.typeID) {
    case TypeID.collection:
    case TypeID.tuple:
      return CstType.STRUCTURED;
    default:
      return CstType.TERM;
  }
}

function inferAlias(node: SPNode, schema: RSForm) {
  return node.existing?.alias ?? generateAlias(inferDraftType(node.type), schema);
}
