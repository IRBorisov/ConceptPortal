'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import clsx from 'clsx';

import { type Constituenta, CstType, type RSForm } from '@/domain/library';
import { generateAlias } from '@/domain/library/rsform-api';
import { type SPNode, StructurePlanner } from '@/domain/library/structure-planner';

import { HelpTopic } from '@/features/help';

import { MiniButton } from '@/components/control';
import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { globalIDs } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { promptUnsaved } from '@/utils/utils';

import { loadRSForm } from '../../backend/rsform-loader';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '../../backend/types';
import { RefsInput } from '../../components/refs-input';

import { StructureFlow } from './structure-flow';

const DEFINITION_TRUNCATE = 35;
const TERM_CHARS_PER_LINE = 50;

export interface DlgStructurePlannerProps {
  schema: RSForm;
  targetID: number;
  isMutable: boolean;
  onCreate: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  onUpdate: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
}

export function DlgStructurePlanner() {
  const { schema, targetID, isMutable, onCreate, onUpdate } = useDialogsStore(
    state => state.props as DlgStructurePlannerProps
  );
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const [currentSchema, setCurrentSchema] = useState(schema);

  const target = currentSchema.cstByID.get(targetID) ?? null;
  const items = target ? new StructurePlanner(currentSchema, target).build() : [];

  const [selectedKey, setSelectedKey] = useState(items[0].key ?? '');
  const [term, setTerm] = useState<string>(
    (isMutable ? items[0].existing?.term_raw : items[0].existing?.term_resolved) ?? ''
  );
  const isMultiline = term.length > TERM_CHARS_PER_LINE || term.includes('\n');

  if (!target?.analysis.type || items.length === 0) {
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
      const nextSchemaDTO = await onUpdate(data);
      setCurrentSchema(loadRSForm(nextSchemaDTO));
    } else {
      const data: CreateConstituentaDTO = {
        insert_after: target!.id,
        cst_type: inferDraftType(target!.cst_type),
        alias: inferAlias(node, currentSchema, target!),
        term_raw: term,
        definition_formal: node.definition,
        definition_raw: '',
        convention: '',
        crucial: false,
        term_forms: []
      };
      const created = await onCreate(data);
      setCurrentSchema(loadRSForm(created.schema));
      setTerm(data.term_raw);
    }
  }

  const isDefinitionTooLong = selectedNode.definition.length > DEFINITION_TRUNCATE;
  const blurClass = 'backdrop-blur-xs bg-background/90';

  return (
    <ModalView
      className='w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]'
      fullScreen
      noFooterButton
      helpTopic={HelpTopic.UI_STRUCTURE_PLANNER}
    >
      <div className='relative flex flex-col h-full'>
        <div className={clsx('z-modal-pop', 'absolute top-0 right-1/2 translate-x-1/2 mr-12', 'flex px-6 items-start')}>
          <div
            className={clsx(
              'w-70 pt-5.5 pr-3 pl-2 pb-3.75',
              'rounded-bl-2xl rounded-tl-2xl truncate whitespace-nowrap',
              'font-math text-right select-none',
              blurClass
            )}
            data-tooltip-id={isDefinitionTooLong ? globalIDs.tooltip : undefined}
            data-tooltip-content={isDefinitionTooLong ? selectedNode.definition : undefined}
          >
            {selectedNode.definition}
          </div>

          <div
            className={clsx(
              'w-8 pt-5.5 pr-3 pb-3.75',
              'font-medium whitespace-nowrap',
              blurClass,
              !selectedCst && 'text-constructive'
            )}
          >
            {selectedCst?.alias ?? inferAlias(selectedNode, currentSchema, target)}
          </div>

          <div
            className={clsx('px-2 pb-2 pt-4', blurClass, !isMutable && 'rounded-br-xl', isMultiline && 'rounded-b-xl')}
          >
            <RefsInput
              id='dlg_structure_term'
              placeholder='Термин не определен'
              areaClassName='w-120'
              maxHeight='6.75rem'
              portalHoverTooltips
              schema={currentSchema}
              value={term}
              initialValue={selectedCst?.term_raw}
              resolved={selectedCst?.term_resolved ?? ''}
              disabled={!isMutable}
              onChange={setTerm}
            />
          </div>

          {isMutable ? (
            <div className={clsx('cc-icons pt-5 pb-3.25 rounded-br-2xl rounded-tr-2xl', blurClass)}>
              <MiniButton
                title={selectedCst ? 'Обновить термин' : 'Создать конституенту'}
                icon={
                  selectedCst ? (
                    <IconSave size='1.25rem' className='icon-primary' />
                  ) : (
                    <IconNewItem size='1.25rem' className='icon-green' />
                  )
                }
                onClick={() => void saveTerm(selectedNode)}
                disabled={!isDirty || term === ''}
              />
              <MiniButton
                title='Сбросить термин'
                icon={<IconReset size='1.25rem' className='icon-primary' />}
                onClick={resetTerm}
                disabled={!isDirty || !selectedCst}
              />
            </div>
          ) : null}
        </div>

        <ReactFlowProvider>
          <StructureFlow
            items={items}
            rootType={target.analysis.type}
            selected={selectedKey}
            setSelected={handleSelectNode}
          />
        </ReactFlowProvider>
      </div>
    </ModalView>
  );
}

function inferDraftType(type: CstType): CstType {
  if (type === CstType.FUNCTION) {
    return CstType.FUNCTION;
  }
  return CstType.TERM;
}

function inferAlias(node: SPNode, schema: RSForm, root: Constituenta) {
  return node.existing?.alias ?? generateAlias(inferDraftType(root.cst_type), schema);
}
