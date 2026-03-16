'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';
import { type Constituenta, CstType } from '@/features/rsform';
import { RSInput } from '@/features/rsform/components/rs-input';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { labelRSExpression } from '@/features/rsform/labels';
import { isBaseSet } from '@/features/rsform/models/rsform-api';
import { type CalculatorResult, type Value } from '@/features/rslang';
import { normalizeValue, valueStub } from '@/features/rslang/eval/value-api';
import { labelType } from '@/features/rslang/labels';
import { ValueInput } from '@/features/rsmodel/components/value-input';
import { useCstStatus } from '@/features/rsmodel/hooks/use-cst-status';

import { Button } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { limits } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue } from '../../../labels';
import { type BasicBinding } from '../../../models/rsmodel';
import { isInferrable, isInterpretable, prepareValueString } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

import { ToolbarExpression } from './toolbar-expression';

interface FormValueProps {
  id?: string;
  toggleReset: boolean;

  activeCst: Constituenta;
}

export function FormValue({ id, toggleReset, activeCst }: FormValueProps) {
  const router = useConceptNavigation();
  const { isMutable, engine, schema } = useRSModelEdit();
  const isProcessing = useMutatingRSModel();
  const typification = activeCst.analysis.type;

  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const showDataText = usePreferencesStore(state => state.showDataText);

  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const status = useCstStatus(engine, activeCst);
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);

  const cstData = useCstValue(engine, activeCst);
  const stub = valueStub(cstData);

  const initialValue = isBase ? engine.basics.get(activeCst.id) ?? ({} as BasicBinding) : cstData;

  const initialStr = prepareValueString(initialValue, typification, schema, engine.basics, showDataText);
  const [inputValue, setInputValue] = useState<string>(initialStr);
  const isTrimmed = inputValue.length > limits.len_data_str;

  const isEditable = isMutable && (isBase || activeCst.cst_type === CstType.STRUCTURED);
  const isDirty = inputValue !== initialStr;

  useLayoutEffect(() => onModifiedEvent(false), [activeCst.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setInputValue(initialStr);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeCst.id, initialStr, toggleReset]);

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
        void engine.setBasicValue(activeCst.id, parsedBinding);
        const newValue = prepareValueString(parsedBinding, typification, schema, engine.basics, showDataText);
        setInputValue(newValue);
      } else {
        const parsedValue = JSON.parse(inputValue) as Value;
        normalizeValue(parsedValue);
        void engine.setStructureValue(activeCst.id, parsedValue);
        const newValue = prepareValueString(parsedValue, typification, schema, engine.basics, showDataText);
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
    const result = engine.calculateCst(activeCst.id);
    setLocalEval(result);
  }

  function handleOpenEdit(cstID: number) {
    void router.changeActive(cstID);
  }

  return (
    <div id={id} className='relative mt-1 cc-column px-6 pb-1 pt-8'>
      <div className='flex items-start'>
        <div className='font-math -mt-0.5 font-medium whitespace-nowrap select-text cursor-default'>
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
            expression={activeCst.definition_formal}
            type={activeCst.analysis.type}
          />
          <RSInput
            label={labelRSExpression(activeCst.cst_type)}
            placeholder='Выражение отсутствует'
            schema={schema}
            value={activeCst.definition_formal}
            disabled
            onOpenEdit={handleOpenEdit}
          />
        </div>
      ) : null}
      <ViewErrors
        className='-mt-3'
        isOpen={!!localEval && localEval.errors.length > 0}
        errors={localEval?.errors ?? null}
      />

      <ValueInput
        className='max-h-100'
        rows={8}
        value={inputValue}
        stub={isDirty ? '' : stub}
        valueLabel={labelValue(localEval ? localEval.value : cstData, typification)}
        status={status}
        placeholder={
          !isInterpretable(activeCst.cst_type) ? 'Значение для данного типа не предусмотрено' : 'Значение отсутствует'
        }
        onCalculate={cstInferrable ? handleCalculate : undefined}
        onChange={setInputValue}
        disabled={!isMutable || cstInferrable || !isInterpretable(activeCst.cst_type) || (showDataText && !isBase)}
      />

      {isEditable ? (
        <Button
          text='Сохранить изменения'
          className='mx-auto w-fit'
          colorSubmit
          icon={<IconSave size='1.25rem' />}
          disabled={isTrimmed || isProcessing || !isModified}
          onClick={onSaveValue}
        />
      ) : null}
    </div>
  );
}
