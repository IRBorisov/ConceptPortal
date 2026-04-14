'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ReactFlowProvider } from '@xyflow/react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { CstType, type RSForm } from '@/domain/library/rsform';
import { generateAlias } from '@/domain/library/rsform-api';
import { readTypeAnnotation, TypeID } from '@/domain/rslang';
import { extractArguments } from '@/domain/rslang/api';
import { labelType } from '@/domain/rslang/labels';

import { HelpTopic } from '@/features/help';
import { loadRSForm } from '@/features/rsform/backend/rsform-loader';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';
import { ASTFlow } from '@/features/rsform/dialogs/dlg-show-ast/ast-flow';
import { ShowAstSchemaProvider } from '@/features/rsform/dialogs/dlg-show-ast/show-ast-schema-context';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { type AstNode, findByUid, flattenAst } from '@/utils/parsing';

import { type AstGraphNode } from '../dlg-show-ast/graph/ast-models';

import { PopoverExtraction } from './popover-extraction';

const NODE_POPUP_DELAY = 100;

export interface DlgShowAstExtractProps {
  initial: {
    ast: AstNode;
    expression: string;
    schema: RSForm;
  };
  targetID: number;
  onCreate: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  onUpdate: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
}

export function DlgShowAstExtract() {
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { initial, targetID, onCreate, onUpdate } = useDialogsStore(state => state.props as DlgShowAstExtractProps);

  const [schema, setSchema] = useState(initial.schema);
  const [expression, setExpression] = useState(initial.expression);
  const [ast, setAst] = useState<AstNode>(initial.ast);
  const flatAst = useMemo(() => flattenAst(ast), [ast]);

  const [hoverID, setHoverID] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  const hoverNode = flatAst.find(node => node.uid === hoverID);
  const selectedNode = selected.length === 1 ? (findByUid(ast, selected[0]) ?? null) : null;
  const [hoverNodeDebounced] = useDebounce(hoverNode, NODE_POPUP_DELAY);

  const [isDragging, setIsDragging] = useState(false);
  const canExtract = !!selectedNode?.parent && selectedNode.children.length > 0;

  function handleSelectedIdsChange(ids: number[]) {
    setSelected(ids);
  }

  async function handleConfirmExtract(newText: string) {
    if (!selectedNode) {
      return;
    }

    const args = extractArguments(selectedNode);
    const isLogic = readTypeAnnotation(selectedNode)?.typeID === TypeID.logic;
    const cstType = isLogic
      ? args.length > 0
        ? CstType.PREDICATE
        : CstType.THEOREM
      : args.length > 0
        ? CstType.FUNCTION
        : CstType.TERM;
    const alias = generateAlias(cstType, schema);
    let definition = expression.slice(selectedNode.from, selectedNode.to).trim();
    if (args.length > 0) {
      definition = `[${args.map(arg => `${arg.alias}∈${labelType(arg.type)}`).join(',')}] ${definition}`;
    }

    const targetIndex = schema.items.findIndex(item => item.id === targetID);
    const insertAfter = targetIndex < 1 ? null : schema.items[targetIndex - 1].id;

    const response = await onCreate({
      alias: alias,
      cst_type: cstType,
      definition_formal: definition,
      definition_raw: '',
      term_raw: newText.trim(),
      term_forms: [],
      convention: '',
      crucial: false,
      insert_after: insertAfter
    });
    let callText = response.new_cst.alias;
    if (args.length > 0) {
      callText = `${callText}[${args.map(arg => arg.alias).join(',')}]`;
    }
    if (selectedNode.from > 0 && expression[selectedNode.from - 1] === 'ℬ') {
      callText = `(${callText})`;
    }
    const updatedExpression = expression.slice(0, selectedNode.from) + callText + expression.slice(selectedNode.to);
    const updatedSchemaDTO = await onUpdate({
      target: targetID,
      item_data: {
        definition_formal: updatedExpression
      }
    });
    const updatedSchema = loadRSForm(updatedSchemaDTO);
    const parse = updatedSchema.analyzer.checkFull(updatedExpression, { annotateTypes: true, annotateErrors: true });
    if (!parse.ast) {
      toast.error(errorMsg.invalidParse);
      hideDialog();
      return;
    }

    setExpression(updatedExpression);
    setAst(parse.ast);
    setSchema(updatedSchema);
    setSelected([]);
    setHoverID(null);
  }

  function handleNodeEnter(node: AstGraphNode) {
    setHoverID(node.data.uid);
  }

  function handleNodeLeave() {
    setHoverID(null);
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
        {!hoverNodeDebounced || isDragging ? expression : null}
        {!isDragging && hoverNodeDebounced ? (
          <div key={hoverNodeDebounced.uid}>
            <span>{expression.slice(0, hoverNodeDebounced.from)}</span>
            <span className='bg-selected cc-animate-background starting:bg-background duration-move'>
              {expression.slice(hoverNodeDebounced.from, hoverNodeDebounced.to)}
            </span>
            <span>{expression.slice(hoverNodeDebounced.to)}</span>
          </div>
        ) : null}
      </div>

      <PopoverExtraction
        className='absolute z-pop left-3 top-10'
        disabled={!canExtract}
        onSubmit={text => void handleConfirmExtract(text)}
      />

      <div className='cc-mask-sides h-full w-full'>
        <ReactFlowProvider>
          <ShowAstSchemaProvider schema={schema}>
            <ASTFlow
              data={flatAst}
              onSelectedChange={handleSelectedIdsChange}
              onNodeEnter={handleNodeEnter}
              onNodeLeave={handleNodeLeave}
              onChangeDragging={setIsDragging}
            />
          </ShowAstSchemaProvider>
        </ReactFlowProvider>
      </div>
    </ModalView>
  );
}
