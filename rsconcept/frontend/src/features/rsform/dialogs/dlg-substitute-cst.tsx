'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { SubstitutionValidator } from '@/features/oss/models/oss-api';

import { ErrorField, TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { schemaSubstitutions, type SubstitutionsDTO } from '../backend/types';
import { useRSForm } from '../backend/use-rsform';
import { useSubstituteConstituents } from '../backend/use-substitute-constituents';
import { PickSubstitutions } from '../components/pick-substitutions';

export interface DlgSubstituteCstProps {
  schemaID: number;
  onSubstitute: (data: SubstitutionsDTO) => void;
}

export function DlgSubstituteCst() {
  const { onSubstitute, schemaID } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const { substituteConstituents: cstSubstitute } = useSubstituteConstituents();
  const { schema } = useRSForm({ itemID: schemaID });

  const form = useForm({
    defaultValues: {
      substitutions: []
    } as SubstitutionsDTO,
    validators: {
      onChange: schemaSubstitutions
    },
    onSubmit: async ({ value }) => {
      await cstSubstitute({ itemID: schema.id, data: value }).then(() => onSubstitute(value));
    }
  });

  const values = useStore(form.store, state => state.values);
  const substitutions = values.substitutions;
  const isValid = useMemo(() => schemaSubstitutions.safeParse(values).success, [values]);

  const validator = useMemo(() => new SubstitutionValidator([schema], substitutions), [schema, substitutions]);
  const isCorrect = validator.validate();

  return (
    <ModalForm
      header='Отождествление'
      submitText='Отождествить'
      canSubmit={isValid}
      validationHint={isValid ? '' : hintMsg.substitutionsEmpty}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-160 px-6 pb-3'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
    >
      <form.Field name='substitutions'>
        {field => (
          <>
            <PickSubstitutions
              allowSelfSubstitution
              value={field.state.value ?? []}
              onChange={field.handleChange}
              rows={6}
              schemas={[schema]}
            />
            <ErrorField className='-mt-6 px-3' error={field.state.meta.errors[0]?.message} />
          </>
        )}
      </form.Field>
      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        className={clsx('mt-3', isCorrect ? '' : 'border-accent-red-foreground border-2')}
      />
    </ModalForm>
  );
}
