'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { useAuthSuspense } from '@/features/auth';

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

/** Form for editing a prompt template. */
export function FormPromptTemplate({ promptTemplate, className, isMutable, toggleReset }: FormPromptTemplateProps) {
  const { user } = useAuthSuspense();
  const isProcessing = useMutatingPrompts();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { updatePromptTemplate } = useUpdatePromptTemplate();
  const [sampleResult, setSampleResult] = useState<string | null>(null);
  const [debouncedResult] = useDebounce(sampleResult, PARAMETER.moveDuration);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { isDirty, errors }
  } = useForm<IUpdatePromptTemplateDTO>({
    resolver: zodResolver(schemaUpdatePromptTemplate),
    defaultValues: {
      owner: promptTemplate.owner,
      label: promptTemplate.label,
      description: promptTemplate.description,
      text: promptTemplate.text,
      is_shared: promptTemplate.is_shared
    },
    mode: 'onChange'
  });
  const text = useWatch({ control, name: 'text' });

  const prevReset = useRef(toggleReset);
  const prevTemplate = useRef(promptTemplate);
  if (prevTemplate.current !== promptTemplate || prevReset.current !== toggleReset) {
    prevTemplate.current = promptTemplate;
    prevReset.current = toggleReset;
    reset({
      owner: promptTemplate.owner,
      label: promptTemplate.label,
      description: promptTemplate.description,
      text: promptTemplate.text,
      is_shared: promptTemplate.is_shared
    });
    setSampleResult(null);
  }

  const prevDirty = useRef(isDirty);
  if (prevDirty.current !== isDirty) {
    prevDirty.current = isDirty;
    setIsModified(isDirty);
  }

  function onSubmit(data: IUpdatePromptTemplateDTO) {
    return updatePromptTemplate({ id: promptTemplate.id, data }).then(() => {
      setIsModified(false);
      reset({ ...data });
    });
  }

  return (
    <form
      id={globalIDs.prompt_editor}
      className={cn('flex flex-col gap-3 px-6 py-2', className)}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <TextInput
        id='prompt_label'
        label='Название' //
        {...register('label')}
        error={errors.label}
        disabled={isProcessing || !isMutable}
      />
      <TextArea
        id='prompt_description'
        label='Описание' //
        {...register('description')}
        error={errors.description}
        disabled={isProcessing || !isMutable}
      />
      <TextArea
        id='prompt_text'
        label='Содержание' //
        fitContent
        className='disabled:min-h-9 max-h-64'
        {...register('text')}
        error={errors.text}
        disabled={isProcessing || !isMutable}
      />
      <div className='flex justify-between'>
        <Controller
          name='is_shared'
          control={control}
          render={({ field }) => (
            <Checkbox
              id='prompt_is_shared'
              label='Общий шаблон'
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={isProcessing || !isMutable || !user.is_staff}
            />
          )}
        />
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
          className='mt-3 max-h-64 min-h-12'
          label='Пример запроса'
          value={sampleResult ?? debouncedResult ?? ''}
          disabled
        />
      </div>
    </form>
  );
}
