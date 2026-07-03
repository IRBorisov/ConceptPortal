'use client';

import { useState } from 'react';

import { useTx } from '@/i18n';
import { type BasicBinding } from '@rsconcept/domain/library';

import { HelpTopic } from '@/features/help';

import { ModalForm, ModalView } from '@/components/modal';

import { BindingEditor } from '../components/binding-editor.tsx';

import { useRsmodelDialogsStore } from './rsmodel-dialog-store';


export interface DlgEditBindingProps {
  initialValue: BasicBinding;
  onChange?: (newValue: BasicBinding) => void;
}

const dialogClassName = 'w-200 h-152 max-w-[calc(100dvw-3rem)] max-h-[calc(100svh-8rem)] px-6 pb-2';

export function DlgEditBinding() {
  const tx = useTx();
  const { initialValue, onChange } = useRsmodelDialogsStore(state => state.props as DlgEditBindingProps);
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
        helpTopic={HelpTopic.UI_MODEL_BINDING}
        header={tx('tx.rslang.binding.edit')}
        submitText={tx('tx.general.save')}
        canSubmit={value !== initialValue}
        onSubmit={handleSubmit}
        className={dialogClassName}
      >
        <BindingEditor value={value} onChange={handleChange} />
      </ModalForm>
    );
  } else {
    return (
      <ModalView
        helpTopic={HelpTopic.UI_MODEL_BINDING}
        header={tx('tx.rslang.binding.view')}
        noFooterButton
        className={dialogClassName}
      >
        <BindingEditor value={value} />
      </ModalView>
    );
  }
}
