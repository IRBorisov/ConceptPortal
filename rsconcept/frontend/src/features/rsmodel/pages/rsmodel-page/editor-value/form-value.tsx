'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { type Constituenta } from '@/features/rsform';
import { isBaseSet } from '@/features/rsform/models/rsform-api';
import { type Value } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';
import { isInferrable } from '@/features/rsmodel/models/rsmodel-api';

import { Button } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { infoMsg } from '@/utils/labels';

import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { type BasicBinding, type RSModel } from '../../../models/rsmodel';
import { useRSModelEdit } from '../rsmodel-context';

interface FormValueProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: Constituenta;
  model: RSModel;
}

export function FormValue({ disabled, id, model, toggleReset, activeCst }: FormValueProps) {
  const { isMutable } = useRSModelEdit();
  const isProcessing = useMutatingRSModel();

  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);

  const isBase = isBaseSet(activeCst.cst_type);

  const initialValue = isBase
    ? (model.basicsContext.get(activeCst.id) ?? ({} as BasicBinding))
    : model.calculator.getValue(activeCst.alias);

  const initialStr = initialValue ? JSON.stringify(initialValue, null, 2) : '';
  const [value, setValue] = useState<string>(initialStr);

  const isDirty = value !== initialStr;

  useLayoutEffect(() => onModifiedEvent(false), [activeCst.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setValue(initialStr);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeCst.id, initialStr, toggleReset, model]);

  useEffect(() => {
    onModifiedEvent(isDirty);
  }, [isDirty]);

  function onSaveValue() {
    if (!value) {
      return;
    }
    try {
      if (isBase) {
        const parsedBinding = JSON.parse(value) as BasicBinding;
        model.basicsContext.set(activeCst.id, parsedBinding);
        model.calculator.setValue(activeCst.alias, Object.keys(parsedBinding).map(Number));
      } else {
        const parsedValue = JSON.parse(value) as Value;
        model.calculator.setValue(activeCst.alias, parsedValue);
      }
      toast.success(infoMsg.changesSaved);
      setIsModified(false);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    }
  }

  return (
    <div
      id={id}
      className='relative mt-1 flex flex-col px-6 pb-1 pt-8'
    >
      <div className='flex items-center'>
        <div className='font-math font-medium whitespace-nowrap select-text cursor-default'>
          {activeCst?.alias ?? ''}
        </div>
        <TextArea
          id='cst_term'
          aria-label='Термин'
          placeholder={disabled ? '' : 'Термин отсутствует'}
          value={activeCst.term_resolved}
          disabled
          readOnly
          noBorder
          fitContent
        />
      </div>
      <TextArea
        id='cst_typification'
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelType(activeCst.analysis.type)}
        className='cursor-default'
      />
      <TextArea
        id='cst_value'
        value={value}
        onChange={event => setValue(event.target.value)}
        fitContent
        rows={8}
        spellCheck
        label='Значение'
        placeholder='Значение отсутствует'
        disabled={!isMutable || isInferrable(activeCst.cst_type)}
      />

      {!disabled || isProcessing ? (
        <Button
          text='Сохранить изменения'
          className='mx-auto w-fit mt-3'
          icon={<IconSave size='1.25rem' />}
          disabled={disabled || !isModified}
          onClick={onSaveValue}
        />
      ) : null}
    </div>
  );
}
