'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';

import { useAuth } from '@/features/auth';
import { HelpTopic } from '@/features/help';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { type ICreatePromptTemplateDTO, type IPromptTemplateDTO, schemaCreatePromptTemplate } from '../backend/types';
import { useAvailableTemplates } from '../backend/use-available-templates';
import { useCreatePromptTemplate } from '../backend/use-create-prompt-template';

export interface DlgCreatePromptTemplateProps {
  onCreate?: (data: RO<IPromptTemplateDTO>) => void;
}

export function DlgCreatePromptTemplate() {
  const tx = useTx();
  const { onCreate } = useDialogsStore(state => state.props as DlgCreatePromptTemplateProps);
  const { createPromptTemplate } = useCreatePromptTemplate();
  const { items: templates } = useAvailableTemplates();
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
      header={tx('tx.ai.template.create')}
      submitText={tx('tx.general.create')}
      canSubmit={canSubmit}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      validationHint={canSubmit ? '' : tx('tx.ai.template.title.hint')}
      className='cc-column w-140 max-h-120 py-2 px-6'
      helpTopic={HelpTopic.ASSISTANT}
    >
      <form.Field name='label'>
        {field => (
          <TextInput
            id='dlg_prompt_label'
            label={tx('tx.ai.template.title')}
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
            label={tx('tx.lib.description')}
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
              label={tx('tx.ai.template.shared')}
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
