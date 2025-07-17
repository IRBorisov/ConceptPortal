import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthSuspense } from '@/features/auth';

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
  const { user } = useAuthSuspense();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors }
  } = useForm<ICreatePromptTemplateDTO>({
    resolver: zodResolver(schemaCreatePromptTemplate),
    defaultValues: {
      label: '',
      description: '',
      text: '',
      is_shared: false
    },
    mode: 'onChange'
  });
  const label = useWatch({ control, name: 'label' });
  const isValid = !!label && !templates.find(template => template.label === label);

  function onSubmit(data: ICreatePromptTemplateDTO) {
    void createPromptTemplate(data).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание шаблона'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      submitInvalidTooltip='Введите уникальное название шаблона'
      className='cc-column w-140 max-h-120 py-2 px-6'
    >
      <TextInput id='dlg_prompt_label' {...register('label')} label='Название шаблона' error={errors.label} />
      <TextArea id='dlg_prompt_description' {...register('description')} label='Описание' error={errors.description} />
      {user.is_staff ? (
        <Controller
          name='is_shared'
          control={control}
          render={({ field }) => (
            <Checkbox
              id='dlg_prompt_is_shared'
              label='Общий шаблон'
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}
