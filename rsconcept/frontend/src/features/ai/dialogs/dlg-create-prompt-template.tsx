'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useAuth } from '@/features/auth';
import { HelpTopic } from '@/features/help';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { type ICreatePromptTemplateDTO, type IPromptTemplateDTO, schemaCreatePromptTemplate } from '../backend/types';
import { useAvailableTemplatesSuspense } from '../backend/use-available-templates';
import { useCreatePromptTemplate } from '../backend/use-create-prompt-template';

export interface DlgCreatePromptTemplateProps {
  onCreate?: (data: RO<IPromptTemplateDTO>) => void;
}

export function DlgCreatePromptTemplate() {
  const { onCreate } = useDialogsStore(state => state.props as DlgCreatePromptTemplateProps);
  const { createPromptTemplate } = useCreatePromptTemplate();
  const { items: templates } = useAvailableTemplatesSuspense();
  const { user } = useAuth();

  const defaultValues: ICreatePromptTemplateDTO = {
    label: '',
    description: '',
    text: '',
    is_shared: false
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaCreatePromptTemplate
    },
    onSubmit: ({ value }) => void createPromptTemplate(value).then(onCreate)
  });

  const label = useStore(form.store, state => state.values.label);
  const canSubmit = useMemo(() => !!label && !templates.find(template => template.label === label), [label, templates]);

  return (
    <ModalForm
      header='Создание шаблона'
      submitText='Создать'
      canSubmit={canSubmit}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      validationHint={canSubmit ? '' : 'Введите уникальное название шаблона'}
      className='cc-column w-140 max-h-120 py-2 px-6'
      helpTopic={HelpTopic.ASSISTANT}
    >
      <form.Field name='label'>
        {field => (
          <TextInput
            id='dlg_prompt_label'
            label='Название шаблона'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <form.Field name='description'>
        {field => (
          <TextArea
            id='dlg_prompt_description'
            label='Описание'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      {user.is_staff ? (
        <form.Field name='is_shared'>
          {field => (
            <Checkbox
              id='dlg_prompt_is_shared'
              label='Общий шаблон'
              value={field.state.value ?? false}
              onChange={(v: boolean) => field.handleChange(v)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      ) : null}
    </ModalForm>
  );
}
