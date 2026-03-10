'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';
import { type Constituenta, CstType } from '@/features/rsform';
import { RSInput } from '@/features/rsform/components/rs-input';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { labelRSExpression } from '@/features/rsform/labels';
import { isBaseSet } from '@/features/rsform/models/rsform-api';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type CalculatorResult, type Value } from '@/features/rslang';
import { normalizeValue } from '@/features/rslang/eval/value-api';
import { labelType } from '@/features/rslang/labels';

import { Button } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue } from '../../../labels';
import { type BasicBinding, type RSModel } from '../../../models/rsmodel';
import { isInferrable, isInterpretable, prepareValueString } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

import { StatusBar } from './status-bar';
import { ToolbarExpression } from './toolbar-expression';
import { ToolbarValue } from './toolbar-value';

interface FormValueProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: Constituenta;
  model: RSModel;
}

export function FormValue({ disabled, id, model, toggleReset, activeCst }: FormValueProps) {
  const router = useConceptNavigation();
  const { isMutable, setValue, setBasicValue, getEvalStatus, calculateCst } = useRSModelEdit();
  const { schema } = useRSFormEdit();
  const isProcessing = useMutatingRSModel();
  const typification = activeCst.analysis.type;

  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const showDataText = usePreferencesStore(state => state.showDataText);

  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const status = getEvalStatus(activeCst.id);
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);

  const cstData = useCstValue(model, activeCst);

  const initialValue = isBase
    ? (model.basicsContext.get(activeCst.id) ?? ({} as BasicBinding))
    : cstData;

  const initialStr = prepareValueString(initialValue, typification, schema, model, showDataText);
  const [inputValue, setInputValue] = useState<string>(initialStr);

  const isDirty = inputValue !== initialStr;

  useLayoutEffect(() => onModifiedEvent(false), [activeCst.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setInputValue(initialStr);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeCst.id, initialStr, toggleReset, model]);

  useEffect(() => {
    onModifiedEvent(isDirty);
  }, [isDirty]);

  function onSaveValue() {
    if (!inputValue) {
      return;
    }
    try {
      if (isBase) {
        const parsedBinding = JSON.parse(inputValue) as BasicBinding;
        const valueBinding = Object.fromEntries(Object.entries(parsedBinding).map(([key, value]) => [Number(key), value]));
        setBasicValue(activeCst.id, valueBinding);
        const newValue = prepareValueString(valueBinding, typification, schema, model, showDataText);
        setInputValue(newValue);
      } else {
        const parsedValue = JSON.parse(inputValue) as Value;
        normalizeValue(parsedValue);
        setValue(activeCst.id, parsedValue);
        const newValue = prepareValueString(parsedValue, typification, schema, model, showDataText);
        setInputValue(newValue);
      }
      setIsModified(false);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    }
  }

  function handleCalculate(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    const result = calculateCst(activeCst.id);
    setLocalEval(result);
  }

  function handleOpenEdit(cstID: number) {
    void router.changeActive(cstID);
  }

  return (
    <div
      id={id}
      className='relative mt-1 cc-column px-6 pb-1 pt-8'
    >
      <div className='flex items-start'>
        <div className='font-math -mt-0.5 font-medium whitespace-nowrap select-text cursor-default'        >
          {activeCst?.alias ?? ''}
        </div>
        <TextArea
          aria-label='Термин'
          placeholder='Термин отсутствует'
          value={activeCst.term_resolved}
          disabled
          readOnly
          noBorder
          fitContent
          noResize
        />
      </div>
      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelType(typification)}
        className='cursor-default'
      />
      {cstInferrable || (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <div className='relative'>
          <ToolbarExpression
            className='absolute -top-1 right-0'
          />
          <RSInput
            label={labelRSExpression(activeCst.cst_type)}
            placeholder='Выражение отсутствует'
            schema={schema}
            value={activeCst.definition_formal}
            disabled
            onOpenEdit={handleOpenEdit}
          />
        </div>) : null}
      <ViewErrors
        className='-mt-3'
        isOpen={!!localEval && localEval.errors.length > 0}
        errors={localEval?.errors ?? null}
        disabled={disabled}
      />

      <div className='relative'>
        <StatusBar
          className='absolute -top-0.5 right-1/2 translate-x-1/2'
          status={status}
          onCalculate={cstInferrable ? (event) => handleCalculate(event) : undefined}
        />
        <div className='absolute -top-0.5 left-24 select-none flex gap-2 items-center'>
          <span
            className='font-math'
            tabIndex={-1}
            data-tooltip-id={globalIDs.tooltip}
            aria-label='Сокращенное значение выражения'
            data-tooltip-content='Значение выражения'
          >
            {labelValue(localEval ? localEval.value : cstData, typification)}
          </span>
        </div>

        <ToolbarValue className='absolute -top-1 right-0' value={inputValue} />

        <TextArea
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          fitContent
          className='max-h-100'
          rows={8}
          spellCheck
          label='Значение'
          placeholder={!isInterpretable(activeCst.cst_type) ? 'Значение для данного типа не предусмотрено' : 'Значение отсутствует'}
          disabled={!isMutable || cstInferrable || !isInterpretable(activeCst.cst_type) || (showDataText && !isBase)}
        />
      </div>

      {!disabled || isProcessing ? (
        <Button
          text='Сохранить изменения'
          className='mx-auto w-fit'
          icon={<IconSave size='1.25rem' />}
          disabled={disabled || !isModified}
          onClick={onSaveValue}
        />
      ) : null}
    </div>
  );
}
