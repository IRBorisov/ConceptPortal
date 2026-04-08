'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { PromptInput } from '@/features/ai/components/prompt-input';
import { useAuth } from '@/features/auth';

import { MiniButton } from '@/components/control';
import { IconSample } from '@/components/icons';
import { Checkbox, TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { globalIDs, PARAMETER } from '@/utils/constants';

import {
  type IPromptTemplate,
  type IUpdatePromptTemplateDTO,
  schemaUpdatePromptTemplate
} from '../../../backend/types';
import { useMutatingPrompts } from '../../../backend/use-mutating-prompts';
import { useUpdatePromptTemplate } from '../../../backend/use-update-prompt-template';
import { generateSample } from '../../../models/prompting-api';

interface FormPromptTemplateProps {
  promptTemplate: IPromptTemplate;
  isMutable: boolean;
  className?: string;
  toggleReset: boolean;
}

function templateDefaults(template: IPromptTemplate): IUpdatePromptTemplateDTO {
  return {
    owner: template.owner,
    label: template.label,
    description: template.description,
    text: template.text,
    is_shared: template.is_shared
  };
}

/** Form for editing a prompt template. */
export function FormPromptTemplate({ promptTemplate, className, isMutable, toggleReset }: FormPromptTemplateProps) {
  const { user } = useAuth();
  const isProcessing = useMutatingPrompts();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const { updatePromptTemplate } = useUpdatePromptTemplate();
  const [sampleResult, setSampleResult] = useState<string | null>(null);
  const [debouncedResult] = useDebounce(sampleResult, PARAMETER.moveDuration);

  const form = useForm({
    defaultValues: templateDefaults(promptTemplate),
    validators: {
      onChange: schemaUpdatePromptTemplate
    },
    onSubmit: async ({ value, formApi }) => {
      await updatePromptTemplate({ id: promptTemplate.id, data: value });
      setIsModified(false);
      formApi.reset(value);
    }
  });

  const onResetEvent = useEffectEvent((next: IUpdatePromptTemplateDTO) => {
    form.reset(next);
  });

  const text = useStore(form.store, state => state.values.text);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const prevReset = useRef(toggleReset);
  const prevTemplate = useRef(promptTemplate);

  useEffect(function resetFormOnTemplateChange() {
    if (prevTemplate.current !== promptTemplate || prevReset.current !== toggleReset) {
      prevTemplate.current = promptTemplate;
      prevReset.current = toggleReset;
      onResetEvent(templateDefaults(promptTemplate));
      return () => setSampleResult(null);
    }
  }, [promptTemplate, toggleReset]);

  useEffect(function synchronizeModifiedState() {
    onModifiedEvent(!isDefaultValue);
  }, [isDefaultValue]);

  function handleChangeText(newValue: string, onChange: (newValue: string) => void) {
    setSampleResult(null);
    onChange(newValue);
  }

  return (
    <form
      id={globalIDs.prompt_editor}
      className={cn('flex flex-col gap-3 px-6 py-2', className)}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name='label'>
        {field => (
          <TextInput
            id='prompt_label'
            label='Название'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            disabled={isProcessing || !isMutable}
          />
        )}
      </form.Field>
      <form.Field name='description'>
        {field => (
          <TextArea
            id='prompt_description'
            label='Описание'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            disabled={isProcessing || !isMutable}
          />
        )}
      </form.Field>

      <form.Field name='text'>
        {field => (
          <PromptInput
            id='prompt_text'
            label='Содержание'
            placeholder='Пример: Предложи дополнение для КС {{schema}}'
            className='disabled:min-h-9 max-h-64'
            value={field.state.value ?? ''}
            onChange={newValue => handleChangeText(newValue, field.handleChange)}
            disabled={isProcessing || !isMutable}
          />
        )}
      </form.Field>
      <div className='flex justify-between'>
        <form.Field name='is_shared'>
          {field => (
            <Checkbox
              id='prompt_is_shared'
              label='Общий шаблон'
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              disabled={isProcessing || !isMutable || !user.is_staff}
            />
          )}
        </form.Field>
        <MiniButton
          title='Сгенерировать пример запроса'
          icon={<IconSample size='1.25rem' className='icon-primary' />}
          onClick={() => setSampleResult(!!sampleResult ? null : generateSample(text))}
          disabled={!text}
        />
      </div>

      <div className={clsx('cc-prompt-result overflow-y-hidden', sampleResult !== null && 'open')}>
        <TextArea
          fitContent
          className='mt-3'
          areaClassName='max-h-64 min-h-12'
          label='Пример запроса'
          value={sampleResult ?? debouncedResult ?? ''}
          disabled
        />
      </div>
    </form>
  );
}
