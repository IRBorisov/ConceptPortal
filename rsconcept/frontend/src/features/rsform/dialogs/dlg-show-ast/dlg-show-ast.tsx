'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { ReactFlowProvider } from '@xyflow/react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import {
  buildSubtreeExtractionPlan,
  buildSubtreeReplacementCall,
  flatAstFromAnnotatedExpression,
  replaceExpressionRange,
  type SubtreeExtractionPlan
} from '@/domain/library/ast-subtree-extraction';
import { type RSForm } from '@/domain/library/rsform';

import { HelpTopic } from '@/features/help';
import { loadRSForm } from '@/features/rsform/backend/rsform-loader';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { type FlatAST } from '@/utils/parsing';

import { ASTFlow } from './ast-flow';
import { PopoverExtraction } from './popover-extraction';
import { ShowAstSchemaProvider } from './show-ast-schema-context';

const NODE_POPUP_DELAY = 100;

export interface DlgShowASTProps {
  syntaxTree: RO<FlatAST>;
  expression: string;
  schema: RSForm;
  targetID?: number;
  onCreate?: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  onUpdate?: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
}

export function DlgShowAST() {
  const { syntaxTree, expression, schema, targetID, onCreate, onUpdate } = useDialogsStore(
    state => state.props as DlgShowASTProps
  );

  const [currentSchema, setCurrentSchema] = useState(schema);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [currentSyntaxTree, setCurrentSyntaxTree] = useState<FlatAST>([...syntaxTree]);

  const [hoverID, setHoverID] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const canExtract = Boolean(targetID && onCreate && onUpdate);

  const hoverNode = currentSyntaxTree.find(node => node.uid === hoverID);
  const selectedNode =
    selectedIds.length === 1
      ? (currentSyntaxTree.find(node => node.uid === selectedIds[0] && node.parent !== node.uid) ?? null)
      : null;
  const [hoverNodeDebounced] = useDebounce(hoverNode, NODE_POPUP_DELAY);

  const [isDragging, setIsDragging] = useState(false);

  function handleSelectedIdsChange(ids: number[]) {
    setSelectedIds(ids);
  }

  async function handleConfirmExtract(newText: string) {
    if (!targetID || !onCreate || !onUpdate || !selectedNode) {
      return;
    }
    const plan: SubtreeExtractionPlan | null = buildSubtreeExtractionPlan(
      currentExpression,
      currentSyntaxTree,
      selectedNode.uid,
      currentSchema
    );
    if (!plan) {
      toast.error(errorMsg.cannotExtractNode);
      return;
    }

    try {
      const response = await onCreate({
        alias: plan.alias,
        cst_type: plan.cst_type,
        definition_formal: plan.definition_formal,
        definition_raw: plan.definition_raw,
        term_raw: newText.trim(),
        term_forms: [],
        convention: '',
        crucial: false,
        insert_after: null
      });
      const callText = buildSubtreeReplacementCall(response.new_cst.alias, plan.paramOriginals);
      const updatedExpression = replaceExpressionRange(currentExpression, plan.replaceFrom, plan.replaceTo, callText);

      const updatedSchemaDTO = await onUpdate({
        target: targetID,
        item_data: {
          definition_formal: updatedExpression
        }
      });
      const updatedSchema = loadRSForm(updatedSchemaDTO);
      const updatedSyntaxTree = flatAstFromAnnotatedExpression(updatedExpression, updatedSchema);

      setCurrentExpression(updatedExpression);
      setCurrentSyntaxTree(updatedSyntaxTree);
      setCurrentSchema(updatedSchema);
      setSelectedIds([]);
      setHoverID(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : String(error);
      toast.error(errorText);
    }
  }

  return (
    <ModalView
      className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]'
      helpTopic={HelpTopic.UI_FORMULA_TREE}
      fullScreen
    >
      <div
        className={clsx(
          'absolute z-pop top-2 right-1/2 translate-x-1/2 max-w-[60ch]',
          'px-2 rounded-2xl',
          'backdrop-blur-xs bg-background/90',
          'font-math text-md text-center'
        )}
      >
        {!hoverNodeDebounced || isDragging ? currentExpression : null}
        {!isDragging && hoverNodeDebounced ? (
          <div key={hoverNodeDebounced.uid}>
            <span>{currentExpression.slice(0, hoverNodeDebounced.from)}</span>
            <span className='bg-selected cc-animate-background starting:bg-background duration-move'>
              {currentExpression.slice(hoverNodeDebounced.from, hoverNodeDebounced.to)}
            </span>
            <span>{currentExpression.slice(hoverNodeDebounced.to)}</span>
          </div>
        ) : null}
      </div>

      {canExtract ? (
        <PopoverExtraction
          className='absolute z-pop left-3 top-10'
          disabled={!selectedNode}
          onSubmit={text => void handleConfirmExtract(text)}
        />
      ) : null}

      <div className='cc-mask-sides h-full w-full'>
        <ReactFlowProvider>
          <ShowAstSchemaProvider schema={currentSchema}>
            <ASTFlow
              data={currentSyntaxTree}
              selectedIds={selectedIds}
              onSelectedIdsChange={handleSelectedIdsChange}
              onNodeEnter={node => setHoverID(Number(node.id))}
              onNodeLeave={() => setHoverID(null)}
              onChangeDragging={setIsDragging}
            />
          </ShowAstSchemaProvider>
        </ReactFlowProvider>
      </div>
    </ModalView>
  );
}
