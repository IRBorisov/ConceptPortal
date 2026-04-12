'use client';

import { useState } from 'react';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { type RSEngine } from '@/domain/library';
import { type TypePath, type Typification, type Value } from '@/domain/rslang';
import { normalizeValue } from '@/domain/rslang/eval/value-api';
import { useDialogsStore } from '@/stores/dialogs';

import { ValueEditor } from '../components/value-editor';

export interface DlgEditValueProps {
  initialValue: Value | null;
  type: Typification;
  engine: RSEngine;
  getHeaderText?: (path: TypePath) => string;
  onChange: (newValue: Value | null) => void;
}

export function DlgEditValue() {
  const { initialValue, type, engine, onChange, getHeaderText } = useDialogsStore(
    state => state.props as DlgEditValueProps
  );
  const [value, setValue] = useState<Value | null>(initialValue);

  function handleChange(newValue: Value | null) {
    if (value !== newValue) {
      setValue(newValue);
    }
  }

  function handleSubmit() {
    if (value !== null) {
      normalizeValue(value);
    }
    onChange(value);
  }

  return (
    <ModalForm
      helpTopic={HelpTopic.UI_MODEL_VALUE_EDIT}
      header='Редактор значения'
      submitText='Сохранить'
      canSubmit={value !== initialValue && !!onChange}
      onSubmit={handleSubmit}
      className='w-230 h-145 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6'
    >
      <ValueEditor
        type={type}
        rows={15}
        perPage={15}
        value={value}
        engine={engine}
        onChange={handleChange}
        getHeaderText={getHeaderText}
      />
    </ModalForm>
  );
}
