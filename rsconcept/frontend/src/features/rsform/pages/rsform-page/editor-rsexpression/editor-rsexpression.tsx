'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { type AnalysisFull, type RSErrorDescription, TokenID } from '@/features/rslang';

import { useResetOnChange } from '@/hooks/use-reset-on-change';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';
import { buildTree, flattenAst } from '@/utils/parsing';

import { normalizeAST, rslangParser } from '../../../../rslang';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { RSInput } from '../../../components/rs-input';
import { RSTextWrapper } from '../../../components/rs-input/text-editing';
import { CstStatus, type IConstituenta } from '../../../models/rsform';
import { getAnalysisFor, inferStatus } from '../../../models/rsform-api';
import { useRSEdit } from '../rsedit-context';

import { ParsingResult } from './parsing-result';
import { RSEditorControls } from './rs-edit-controls';
import { StatusBar } from './status-bar';
import { ToolbarRSExpression } from './toolbar-rsexpression';

interface EditorRSExpressionProps {
  id?: string;
  value: string;
  onChange: (newValue: string) => void;
  analysis: RO<AnalysisFull> | null;
  activeCst: IConstituenta;

  label: string;
  placeholder?: string;
  disabled?: boolean;
  toggleReset?: boolean;

  onAnalysis: (typification: RO<AnalysisFull> | null) => void;
  onOpenEdit: (cstID: number) => void;
  onShowTypeGraph: (event: React.MouseEvent<Element>) => void;
}

function extractCstData(cst: IConstituenta) {
  return {
    id: cst.id,
    alias: cst.alias,
    type: cst.cst_type,
    definition_formal: cst.definition_formal,
    definition_raw: cst.definition_raw,
    term_raw: cst.term_raw,
    term_resolved: cst.term_resolved,
    term_forms: cst.term_forms,
    convention: cst.convention
  };
}

export function EditorRSExpression({
  activeCst,
  disabled,
  analysis,
  value,
  toggleReset,
  onChange,
  onAnalysis,
  onOpenEdit,
  onShowTypeGraph,
  ...restProps
}: EditorRSExpressionProps) {
  const schema = useRSEdit().schema;

  const [isModified, setIsModified] = useState(false);
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  const isProcessing = useMutatingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const showAST = useDialogsStore(state => state.showShowAST);

  const resetHandler = useCallback(() => {
    setIsModified(false);
    onAnalysis(null);
  }, [onAnalysis]);

  const cstHash = extractCstData(activeCst);
  useResetOnChange([cstHash, toggleReset], resetHandler);

  const status = (() => {
    if (isModified) {
      return CstStatus.UNKNOWN;
    }
    if (analysis) {
      return inferStatus(analysis.success, analysis.valueClass);
    } else {
      return inferStatus(activeCst.analysis.success, activeCst.analysis.valueClass);
    }
  })();

  function handleChange(newValue: string) {
    onChange(newValue);
    setIsModified(newValue !== activeCst.definition_formal);
  }

  function handleCheckExpression(
    event: React.MouseEvent<Element> | null,
    callback?: (parse: RO<AnalysisFull>) => void
  ) {
    event?.preventDefault();
    event?.stopPropagation();
    try {
      const parse = getAnalysisFor(value, activeCst.cst_type, schema);
      onAnalysis(parse);
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0]);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      callback?.(parse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
      console.error(err);
    }

  }

  function onShowError(error: RO<RSErrorDescription>) {
    if (!rsInput.current) {
      return;
    }
    let errorPosition = error.position;
    if (errorPosition < 0) errorPosition = 0;
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: errorPosition,
        head: errorPosition
      }
    });
    rsInput.current?.view?.focus();
  }

  function handleEdit(id: TokenID, key?: string) {
    if (!rsInput.current?.editor || !rsInput.current.state || !rsInput.current.view) {
      return;
    }
    const text = new RSTextWrapper(rsInput.current as Required<ReactCodeMirrorRef>);
    if (id === TokenID.ID_LOCAL) {
      text.replaceWith(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    rsInput.current?.view?.focus();
    setIsModified(true);
  }

  function handleShowAST(event: React.MouseEvent<Element>) {
    if (event.ctrlKey || event.metaKey) {
      const tree = rslangParser.parse(value);
      const ast = buildTree(tree.cursor());
      const flatAst = flattenAst(ast);
      showAST({ syntaxTree: flatAst, expression: value });
    } else {
      const tree = rslangParser.parse(value);
      const ast = buildTree(tree.cursor());
      normalizeAST(ast, value);
      const flatAst = flattenAst(ast);
      showAST({ syntaxTree: flatAst, expression: value });
    }
  }

  return (
    <div className='relative'>
      <ToolbarRSExpression
        className='absolute -top-2 right-0'
        showAST={handleShowAST}
        showTypeGraph={onShowTypeGraph}
        disabled={disabled}
      />

      <StatusBar
        className='absolute -top-2 right-1/2 translate-x-1/2'
        status={status}
        onAnalyze={(event) => handleCheckExpression(event)}
      />

      <RSInput
        ref={rsInput}
        value={value}
        schema={schema}
        minHeight='3.75rem'
        maxHeight='8rem'
        onChange={handleChange}
        onAnalyze={() => handleCheckExpression(null)}
        onOpenEdit={onOpenEdit}
        disabled={disabled}
        {...restProps}
      />

      <RSEditorControls
        isOpen={showControls && (!disabled || (isProcessing && !activeCst.is_inherited))}
        onEdit={handleEdit}
        disabled={disabled}
      />

      <ParsingResult
        isOpen={!!analysis && analysis.errors.length > 0}
        data={analysis}
        onShowError={error => onShowError(error)}
        disabled={disabled}
      />
    </div>
  );
}
