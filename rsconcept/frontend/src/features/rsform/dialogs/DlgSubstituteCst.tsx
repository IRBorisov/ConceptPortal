'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ErrorField } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICstSubstitutionsDTO, schemaCstSubstitutions } from '../backend/types';
import { useCstSubstitute } from '../backend/useCstSubstitute';
import { PickSubstitutions } from '../components/PickSubstitutions';
import { type IRSForm } from '../models/rsform';

export interface DlgSubstituteCstProps {
  schema: IRSForm;
  onSubstitute: (data: ICstSubstitutionsDTO) => void;
}

export function DlgSubstituteCst() {
  const { onSubstitute, schema } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const { cstSubstitute } = useCstSubstitute();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<ICstSubstitutionsDTO>({
    resolver: zodResolver(schemaCstSubstitutions),
    defaultValues: {
      substitutions: []
    },
    mode: 'onChange'
  });

  function onSubmit(data: ICstSubstitutionsDTO) {
    return cstSubstitute({ itemID: schema.id, data: data }).then(() => onSubstitute(data));
  }

  return (
    <ModalForm
      header='Отождествление'
      submitText='Отождествить'
      submitInvalidTooltip='Выберите две различные конституенты'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-160 px-6 pb-3'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
    >
      <Controller
        control={control}
        name='substitutions'
        render={({ field }) => (
          <PickSubstitutions
            allowSelfSubstitution
            value={field.value}
            onChange={field.onChange}
            rows={6}
            schemas={[schema]}
          />
        )}
      />
      <ErrorField className='mt-2' error={errors.substitutions} />
    </ModalForm>
  );
}
