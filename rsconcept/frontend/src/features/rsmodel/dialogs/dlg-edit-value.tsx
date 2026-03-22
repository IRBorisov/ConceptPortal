'use client';

import { useState } from 'react';

import { type TypePath, type Typification, type Value } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';

import { TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { ValueTable } from '../components/value-table';
import { type RSEngine } from '../models/rsengine';

export interface DlgEditValueProps {
  initialValue: Value;
  type: Typification;
  engine: RSEngine;
  getHeaderText?: (path: TypePath) => string;
  onChange?: (newValue: Value) => void;
}

export function DlgEditValue() {
  const {
    initialValue, type, engine,
    onChange, getHeaderText
  } = useDialogsStore(state => state.props as DlgEditValueProps);
  const [value, setValue] = useState<Value>(JSON.parse(JSON.stringify(initialValue)) as Value);
  const [isModified, setIsModified] = useState(false);

  function handleChange(newValue: Value) {
    if (value !== newValue) {
      setValue(newValue);
    }
    setIsModified(true);
  }

  function handleSubmit() {
    onChange?.(value);
  }

  return (
    <ModalForm
      header='Редактор значения'
      submitText='Сохранить'
      canSubmit={!isModified && !!onChange}
      onSubmit={handleSubmit}
      className='max-w-[calc(100dvw-3rem)] min-w-160 max-h-[calc(100svh-8rem)] min-h-160 pb-3 px-6 cc-column'
    >
      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelType(type)}
        className='cursor-default grow-0'
      />

      <ValueTable
        heightMargin='10rem'
        type={type}
        value={value}
        engine={engine}
        onChange={handleChange}
        getHeaderText={getHeaderText}
      />

    </ModalForm>
  );
}
