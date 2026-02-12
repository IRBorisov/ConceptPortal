'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { SubstitutionValidator } from '@/features/oss/models/oss-api';

import { ErrorField, TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { schemaSubstitutions, type SubstitutionsDTO } from '../backend/types';
import { useRSFormSuspense } from '../backend/use-rsform';
import { useSubstituteConstituents } from '../backend/use-substitute-constituents';
import { PickSubstitutions } from '../components/pick-substitutions';

export interface DlgSubstituteCstProps {
  schemaID: number;
  onSubstitute: (data: SubstitutionsDTO) => void;
}

export function DlgSubstituteCst() {
  const { onSubstitute, schemaID } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const { substituteConstituents: cstSubstitute } = useSubstituteConstituents();
  const { schema } = useRSFormSuspense({ itemID: schemaID });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<SubstitutionsDTO>({
    resolver: zodResolver(schemaSubstitutions),
    defaultValues: {
      substitutions: []
    },
    mode: 'onChange'
  });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const validator = new SubstitutionValidator([schema], substitutions);
  const isCorrect = validator.validate();

  function onSubmit(data: SubstitutionsDTO) {
    return cstSubstitute({ itemID: schema.id, data: data }).then(() => onSubstitute(data));
  }

  return (
    <ModalForm
      header='Отождествление'
      submitText='Отождествить'
      canSubmit={isValid}
      validationHint={isValid ? '' : hintMsg.substitutionsEmpty}
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
            value={field.value ?? []}
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
        className={clsx('mt-3', isCorrect ? '' : 'border-accent-red-foreground border-2')}
      />
    </ModalForm>
  );
}
