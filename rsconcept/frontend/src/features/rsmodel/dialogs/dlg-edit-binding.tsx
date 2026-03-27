'use client';

import { useState } from 'react';

import { ModalForm, ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { BindingEditor } from '../components/binding-editor.tsx';
import { type BasicBinding } from '../models/rsmodel';

export interface DlgEditBindingProps {
  initialValue: BasicBinding;
  onChange?: (newValue: BasicBinding) => void;
}

export function DlgEditBinding() {
  const { initialValue, onChange } = useDialogsStore(state => state.props as DlgEditBindingProps);
  const [value, setValue] = useState<BasicBinding>(initialValue);

  function handleChange(newValue: BasicBinding) {
    if (value !== newValue) {
      setValue(newValue);
    }
  }

  function handleSubmit() {
    onChange?.(value);
  }

  if (onChange) {
    return (
      <ModalForm
        header='Редактор базового источника'
        submitText='Сохранить'
        canSubmit={value !== initialValue}
        onSubmit={handleSubmit}
        className='w-200 h-152 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6'
      >
        <BindingEditor
          value={value}
          onChange={handleChange}
          className='mb-2 h-150'
        />
      </ModalForm>
    );
  } else {
    return (
      <ModalView
        header='Просмотр базового источника'
        noFooterButton
        className='w-200 h-152 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6'
      >
        <BindingEditor
          value={value}
          className='mb-2 h-150'
        />
      </ModalView>
    );
  }
}
