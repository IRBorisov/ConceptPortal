'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { type Constituenta, CstStatus, type RSForm } from '@/domain/library';
import { getAnalysisFor, inferStatus } from '@/domain/library/rsform-api';
import { type AnalysisFull, type ExpressionType, type RSErrorDescription, TokenID } from '@/domain/rslang';
import { rslangParser } from '@/domain/rslang';
import { useTx } from '@/i18n';

import { type HelpTopic } from '@/features/help';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';

import { cn } from '@/components/utils';
import { useResetOnChange } from '@/hooks/use-reset-on-change';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';
import { buildTree, flattenAst } from '@/utils/parsing';

import { RSInput } from '../rs-input';
import { RSTextWrapper } from '../rs-input/text-editing';
import { ViewErrors } from '../view-errors';

import { RSEditorControls } from './rs-edit-controls';
import { StatusBar } from './status-bar';
import { ToolbarRSExpression } from './toolbar-rsexpression';

interface EditorRSExpressionProps {
  id?: string;
  className?: string;
  value: string;
  onChange: (newValue: string) => void;
  schema: RSForm;
  activeCst?: Constituenta;

  label: string;
  placeholder?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  toggleReset?: boolean;
  errors?: RO<RSErrorDescription[] | null>;
  analysis?: RO<AnalysisFull> | null;
  status?: CstStatus;
  showStatus?: boolean;
  helpTopic?: HelpTopic;
  expressionType?: ExpressionType | null;
  extractionDisabled?: boolean;

  onAnalyze?: (event: React.MouseEvent<Element> | null) => void;
  onAnalysis?: (typification: RO<AnalysisFull> | null) => void;
  onOpenEdit: (cstID: number) => void;
  onShowTypeGraph?: (event: React.MouseEvent<Element>) => void;
  onCreateCst?: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  onUpdateCst?: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
}

export function EditorRSExpression({
  activeCst,
  className,
  disabled,
  errors: externalErrors,
  analysis,
  value,
  toggleReset,
  schema,
  isProcessing,
  status: statusProp,
  showStatus,
  helpTopic,
  expressionType,
  extractionDisabled,
  onChange,
  onAnalyze,
  onAnalysis,
  onOpenEdit,
  onShowTypeGraph,
  onCreateCst,
  onUpdateCst,
  ...restProps
}: EditorRSExpressionProps) {
  const tx = useTx();
  const [needsAnalyze, setNeedsAnalyze] = useState(false);
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const showFlatAst = useDialogsStore(state => state.showShowFlatAst);
  const showAstExtract = useDialogsStore(state => state.showShowAstExtract);
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const [errors, setErrors] = useState<RO<RSErrorDescription[] | null>>(analysis?.errors ?? null);

  function resetHandler() {
    setNeedsAnalyze(false);
    onAnalysis?.(null);
  }

  useEffect(
    function syncErrors() {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors(analysis?.errors ?? null);
    },
    [analysis]
  );

  const cstHash = activeCst ? extractCstData(activeCst) : null;
  useResetOnChange([cstHash, toggleReset], resetHandler);

  const status = statusProp ?? getStatus();
  const displayedErrors = externalErrors === undefined ? errors : externalErrors;

  function getStatus() {
    if (needsAnalyze) {
      return CstStatus.UNKNOWN;
    }
    if (analysis) {
      return inferStatus(analysis.success, analysis.valueClass);
    } else if (activeCst) {
      return inferStatus(activeCst.analysis.success, activeCst.analysis.valueClass);
    }
    return CstStatus.UNKNOWN;
  }

  function handleChange(newValue: string) {
    onChange(newValue);
    if (activeCst) {
      setNeedsAnalyze(newValue !== activeCst.definition_formal);
    }
    setErrors(null);
  }

  function handleCheckExpression(
    event: React.MouseEvent<Element> | null,
    callback?: (parse: RO<AnalysisFull>) => void
  ) {
    event?.preventDefault();
    event?.stopPropagation();
    if (onAnalyze) {
      onAnalyze(event);
      return;
    }
    if (!activeCst || !onAnalysis) {
      return;
    }
    try {
      const parse = getAnalysisFor(value, activeCst.cst_type, schema);
      onAnalysis(parse);
      if (parse.errors.length > 0) {
        handleShowError(parse.errors[0]);
      } else {
        rsInput.current?.view?.focus();
      }
      setNeedsAnalyze(false);
      callback?.(parse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
      console.error(err);
    }
  }

  function handleShowError(error: RO<RSErrorDescription>) {
    if (!rsInput.current) {
      return;
    }
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: error.from,
        head: error.to
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
    setNeedsAnalyze(true);
  }

  function handleShowAST(event: React.MouseEvent<Element>) {
    if (event.ctrlKey || event.metaKey) {
      const tree = rslangParser.parse(value);
      const ast = buildTree(tree.cursor());
      const flatAst = flattenAst(ast);
      showFlatAst({
        ast: flatAst,
        expression: value,
        schema
      });
    } else {
      const parse = schema.analyzer.checkFull(value, { annotateTypes: true, annotateErrors: true });
      if (!parse.ast) {
        toast.error(tx('tx.rsexpression.ast.fail'));
        return;
      }
      if (!parse.ast.hasError && !extractionDisabled && !disabled && activeCst && onCreateCst && onUpdateCst) {
        showAstExtract({
          initial: {
            ast: parse.ast,
            expression: value,
            schema
          },
          targetID: activeCst.id,
          onCreate: onCreateCst,
          onUpdate: onUpdateCst
        });
      } else {
        showFlatAst({
          ast: flattenAst(parse.ast),
          expression: value,
          schema
        });
      }
    }
  }

  function handleShowTypeGraph(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    if (onShowTypeGraph) {
      onShowTypeGraph(event);
      return;
    }

    let targetType = expressionType;
    if (!targetType) {
      const parse = schema.analyzer.checkFast(value);
      targetType = parse.type;
    }
    if (!targetType) {
      toast.error(tx('tx.typeGraph.fromExpression.fail'));
      return;
    }
    showTypification({ items: [{ alias: activeCst?.alias ?? 'TARGET', type: targetType }] });
  }

  return (
    <div className={cn('relative', className)}>
      <ToolbarRSExpression
        className='absolute -top-1 right-0'
        showAST={handleShowAST}
        showTypeGraph={handleShowTypeGraph}
        disabled={disabled}
        isProcessing={isProcessing}
        helpTopic={helpTopic}
      />

      {showStatus ? (
        <StatusBar
          className='absolute -top-1 right-1/2 translate-x-1/2'
          status={status}
          onAnalyze={event => handleCheckExpression(event)}
        />
      ) : null}

      <RSInput
        ref={rsInput}
        value={value}
        schema={schema}
        errors={displayedErrors}
        minHeight='3.75rem'
        maxHeight='8rem'
        onChange={handleChange}
        onAnalyze={() => handleCheckExpression(null)}
        onOpenEdit={onOpenEdit}
        disabled={disabled}
        errorMessage={
          activeCst && activeCst.formalDuplicates.length > 0 && activeCst.definition_formal === value
            ? tx('tx.lib.defineFormal.validate.duplicate', {
                aliases: formatAliasList(activeCst.formalDuplicates, schema)
              })
            : undefined
        }
        {...restProps}
      />

      <RSEditorControls
        isOpen={showControls && (!disabled || (!!isProcessing && !activeCst?.is_inherited))}
        onEdit={handleEdit}
        disabled={disabled}
      />

      <ViewErrors
        isOpen={!!displayedErrors && displayedErrors.length > 0}
        errors={displayedErrors ?? null}
        onShowError={error => handleShowError(error)}
        disabled={disabled}
      />
    </div>
  );
}

function extractCstData(cst: Constituenta) {
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

function formatAliasList(items: readonly number[], schema: RSForm) {
  if (items.length === 0) {
    return '';
  }
  return items.map(item => schema.cstByID.get(item)!.alias).join(', ');
}
