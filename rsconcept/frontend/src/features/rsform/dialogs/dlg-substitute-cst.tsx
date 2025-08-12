'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { SubstitutionValidator } from '@/features/oss/models/oss-api';

import { ErrorField, TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type ISubstitutionsDTO, schemaSubstitutions } from '../backend/types';
import { useSubstituteConstituents } from '../backend/use-substitute-constituents';
import { PickSubstitutions } from '../components/pick-substitutions';
import { type IRSForm } from '../models/rsform';

export interface DlgSubstituteCstProps {
  schema: IRSForm;
  onSubstitute: (data: ISubstitutionsDTO) => void;
}

export function DlgSubstituteCst() {
  const { onSubstitute, schema } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const { substituteConstituents: cstSubstitute } = useSubstituteConstituents();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<ISubstitutionsDTO>({
    resolver: zodResolver(schemaSubstitutions),
    defaultValues: {
      substitutions: []
    },
    mode: 'onChange'
  });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const validator = new SubstitutionValidator([schema], substitutions);
  const isCorrect = validator.validate();

  function onSubmit(data: ISubstitutionsDTO) {
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
      <ErrorField className='-mt-6 px-3' error={errors.substitutions} />
      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        className={clsx('mt-3', isCorrect ? '' : 'border-(--acc-fg-red) border-2')}
      />
    </ModalForm>
  );
}
