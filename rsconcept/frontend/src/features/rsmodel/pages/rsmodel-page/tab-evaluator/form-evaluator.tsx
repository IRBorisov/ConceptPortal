'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { useConceptNavigation } from '@/app';
import { CstType } from '@/features/rsform';
import { RSEditorControls } from '@/features/rsform/components/editor-rsexpression/rs-edit-controls';
import { RSInput } from '@/features/rsform/components/rs-input';
import { RSTextWrapper } from '@/features/rsform/components/rs-input/text-editing';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type AnalysisFull, type CalculatorResult, type RSErrorDescription, TokenID } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';
import { ValueInput } from '@/features/rsmodel/components/value-input';

import { TextArea } from '@/components/input';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { infoMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { labelValue } from '../../../labels';
import { fastEvaluation, inferStatus, prepareValueString } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';
import { ToolbarExpression } from '../tab-value/toolbar-expression';

interface FormEvaluatorProps {
  id?: string;
  className?: string;
}

export function FormEvaluator({ id, className }: FormEvaluatorProps) {
  const router = useConceptNavigation();
  const { schema, activeCst } = useRSFormEdit();
  const { engine } = useRSModelEdit();

  const showDataText = usePreferencesStore(state => state.showDataText);

  const rsInput = useRef<ReactCodeMirrorRef>(null);
  const [evaluatedExpression, setEvaluatedExpression] = useState<string>('');
  const [expression, setExpression] = useState<string>(activeCst?.definition_formal ?? '');
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);
  const valueStr = prepareValueString(
    localEval?.value ?? null, localParse?.type ?? null, schema, engine.basics, showDataText
  );
  const isModified = evaluatedExpression !== expression;
  const status = inferStatus(localEval?.value ?? null, CstType.TERM, !isModified);
  const errors = [...(localParse?.errors ?? []), ...(localEval?.errors ?? [])];

  function handleOpenCst(cstID: number) {
    void router.changeActive(cstID);
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
  }

  function handleCalculate() {
    setLocalEval(null);
    setLocalParse(null);
    setEvaluatedExpression(expression);

    const parse = schema.analyzer.checkFull(expression);
    setLocalParse(parse);
    if (!parse.success || !parse.ast) {
      return;
    }

    const startTime = performance.now();
    try {
      const value = fastEvaluation(expression, CstType.TERM, schema, engine.calculator);
      const evaluation: CalculatorResult = {
        value,
        iterations: 0,
        errors: []
      };
      setLocalEval(evaluation);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    }

    const endTime = performance.now();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
    toast.success(infoMsg.calculationSuccess(timeSpent));
  }

  function handleShowError(error: RO<RSErrorDescription>) {
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

  return (
    <div id={id} className={cn('cc-column mt-1 pb-1 px-6 h-fit', className)}>
      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelType(localParse?.type ?? null)}
        className='cursor-default'
      />

      <div className='relative'>
        <ToolbarExpression
          className='absolute -top-1 right-0 -translate-y-full'
          expression={expression}
          type={localParse?.type ?? null}
        />
        <RSInput
          ref={rsInput}
          placeholder='Выражение отсутствует'
          schema={schema}
          value={expression}
          onChange={setExpression}
          onOpenEdit={handleOpenCst}
        />
        <RSEditorControls
          isOpen={true}
          onEdit={handleEdit}
        />
      </div>
      <ViewErrors
        className='-mt-3'
        onShowError={handleShowError}
        isOpen={errors.length > 0}
        errors={errors}
      />

      <ValueInput
        className='max-h-100'
        rows={8}
        value={valueStr}
        valueLabel={labelValue(localEval?.value ?? null, localParse?.type ?? null)}
        status={status}
        placeholder='Значение отсутствует'
        onCalculate={handleCalculate}
        disabled
      />
    </div>
  );
}
