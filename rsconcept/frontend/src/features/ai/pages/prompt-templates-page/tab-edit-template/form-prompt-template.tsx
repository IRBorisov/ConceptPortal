'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMutatingPrompts } from '@/features/ai/backend/use-mutating-prompts';
import { useUpdatePromptTemplate } from '@/features/ai/backend/use-update-prompt-template';
import { useAuthSuspense } from '@/features/auth';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import {
  type IPromptTemplate,
  type IUpdatePromptTemplateDTO,
  schemaUpdatePromptTemplate
} from '../../../backend/types';

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
    }
  });

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
      className={cn('flex flex-col gap-3 px-6', className)}
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
        {...register('text')}
        error={errors.text}
        disabled={isProcessing || !isMutable}
      />

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
    </form>
  );
}
