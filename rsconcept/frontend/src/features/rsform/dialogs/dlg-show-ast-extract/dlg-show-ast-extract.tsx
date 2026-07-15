'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { ReactFlowProvider } from '@xyflow/react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { useTx } from '@/i18n';
import { CstType, type RSForm } from '@rsconcept/domain/library/rsform';
import { generateAlias } from '@rsconcept/domain/library/rsform-api';
import { type AstNode, findByUid, flattenAst } from '@rsconcept/domain/parsing';
import { readTypeAnnotation, TypeID } from '@rsconcept/domain/rslang';
import { extractArguments } from '@rsconcept/domain/rslang/api';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { HelpTopic } from '@/features/help';
import { DialogTourID } from '@/features/onboarding/tours/editor-tours';
import { loadRSForm } from '@/features/rsform/backend/rsform-loader';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';

import { ModalView } from '@/components/modal';
import { PARAMETER } from '@/utils/constants';

import { ASTFlow } from '../dlg-show-ast/ast-flow';
import { type AstGraphNode } from '../dlg-show-ast/graph/ast-models';
import { ShowAstSchemaProvider } from '../dlg-show-ast/show-ast-schema-context';
import { useRsformDialogsStore } from '../rsform-dialog-store';

import { PopoverExtraction } from './popover-extraction';

const NODE_POPUP_DELAY = 100;

export interface DlgShowAstExtractProps {
  initial: {
    ast: AstNode;
    expression: string;
    schema: RSForm;
  };
  targetID: number;
  onCreate: (data: CreateConstituentaDTO) => Promise<ConstituentaCreatedResponse>;
  onUpdate: (data: UpdateConstituentaDTO) => Promise<RSFormDTO>;
}

export function DlgShowAstExtract() {
  const tx = useTx();
  const hideDialog = useRsformDialogsStore(state => state.hideDialog);
  const { initial, targetID, onCreate, onUpdate } = useRsformDialogsStore(
    state => state.props as DlgShowAstExtractProps
  );

  const [schema, setSchema] = useState(initial.schema);
  const [expression, setExpression] = useState(initial.expression);
  const [ast, setAst] = useState<AstNode>(initial.ast);
  const flatAst = useMemo(() => flattenAst(ast), [ast]);

  const [hoverID, setHoverID] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  const hoverNode = flatAst.find(node => node.uid === hoverID);
  const selectedNode = selected.length === 1 ? (findByUid(ast, selected[0]) ?? null) : null;
  const [hoverNodeDebounced] = useDebounce(hoverNode, NODE_POPUP_DELAY);

  const extractPopoverFocus = useRef<ReactCodeMirrorRef | null>(null);
  const astInteractionRef = useRef<HTMLDivElement | null>(null);
  const wasPopoverOpenRef = useRef(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const canExtract = !!selectedNode?.parent && selectedNode.children.length > 0;

  useEffect(
    function restoreAstFocusAfterPopoverClose() {
      if (wasPopoverOpenRef.current && !popoverOpen) {
        setTimeout(function focusAstInteraction() {
          astInteractionRef.current?.focus();
        }, PARAMETER.minimalTimeout);
      }
      wasPopoverOpenRef.current = popoverOpen;
    },
    [popoverOpen]
  );

  function handleSelectedIdsChange(ids: number[]) {
    setSelected(ids);
  }

  async function handleConfirmExtract(term: string, definitionText: string) {
    if (!selectedNode) {
      return;
    }

    const data = prepareExtraction(selectedNode, schema, expression, targetID);
    const response = await onCreate({
      alias: data.alias,
      cst_type: data.cstType,
      typification_manual: '',
      value_is_property: false,
      definition_formal: data.definition,
      definition_raw: definitionText.trim(),
      term_raw: term.trim(),
      term_forms: [],
      convention: '',
      crucial: false,
      insert_after: data.position
    });
    let callText = response.new_cst.alias;
    if (data.args.length > 0) {
      callText = `${callText}[${data.args.map(arg => arg.alias).join(', ')}]`;
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
      toast.error(tx('tx.rsexpression.ast.fail'));
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'KeyQ' && canExtract) {
      event.preventDefault();
      event.stopPropagation();
      setPopoverOpen(prev => !prev);
      if (!popoverOpen) {
        setTimeout(function focusExtractPopover() {
          extractPopoverFocus.current?.view?.focus();
        }, PARAMETER.minimalTimeout);
      }
    }
  }

  return (
    <ModalView
      className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]'
      helpTopic={HelpTopic.UI_FORMULA_TREE}
      tourID={DialogTourID.FORMULA_TREE}
      fullScreen
    >
      <div
        className={clsx(
          'absolute z-pop top-2 right-1/2 translate-x-1/2',
          'flex flex-col items-center w-full pointer-events-none gap-1'
        )}
      >
        <div
          data-tour='ast-expression'
          className={clsx(
            'max-w-[60ch]',
            'px-2 rounded-2xl',
            'backdrop-blur-xs bg-background/90',
            'font-math text-md text-center wrap-anywhere'
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
          className='pointer-events-auto'
          disabled={!canExtract}
          schema={schema}
          open={popoverOpen}
          setOpen={setPopoverOpen}
          focusRef={extractPopoverFocus}
          onSubmit={(term, definitionText) => void handleConfirmExtract(term, definitionText)}
        />
      </div>

      <div
        ref={astInteractionRef}
        tabIndex={-1}
        className='cc-mask-sides h-full w-full'
        data-tour='ast-canvas'
        onKeyDown={handleKeyDown}
      >
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

// =========== Internal ==========
function prepareExtraction(selectedNode: AstNode, schema: RSForm, expression: string, targetID: number) {
  const args = extractArguments(selectedNode);
  const isLogic = readTypeAnnotation(selectedNode)?.typeID === TypeID.logic;
  const cstType = isLogic
    ? args.length > 0
      ? CstType.PREDICATE
      : CstType.STATEMENT
    : args.length > 0
      ? CstType.FUNCTION
      : CstType.TERM;
  const alias = generateAlias(cstType, schema);
  let definition = expression.slice(selectedNode.from, selectedNode.to).trim();
  if (args.length > 0) {
    definition = `[${args.map(arg => `${arg.alias}∈${labelType(arg.type)}`).join(', ')}] ${definition}`;
  }
  const targetIndex = schema.items.findIndex(item => item.id === targetID);
  const position = targetIndex < 1 ? null : schema.items[targetIndex - 1].id;
  return { cstType, args, alias, definition, position };
}
