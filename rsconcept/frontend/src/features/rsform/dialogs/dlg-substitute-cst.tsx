'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { type RSForm } from '@/domain/library';
import { SubstitutionValidator } from '@/domain/library/oss-api';
import { formatZodErrorMessage, useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { describeSubstitutionError } from '@/features/oss/labels';

import { ErrorField, TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { schemaSubstitutions, type SubstitutionsDTO } from '../backend/types';
import { PickSubstitutions } from '../components/pick-substitutions';

export interface DlgSubstituteCstProps {
  schema: RSForm;
  onSubstitute: (data: SubstitutionsDTO) => void;
}

export function DlgSubstituteCst() {
  const tx = useTx();
  const { onSubstitute, schema } = useDialogsStore(state => state.props as DlgSubstituteCstProps);

  const defaultValues: SubstitutionsDTO = {
    substitutions: []
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaSubstitutions
    },
    onSubmit: ({ value }) => onSubstitute(value)
  });

  const values = useStore(form.store, state => state.values);
  const substitutions = values.substitutions;
  const isValid = schemaSubstitutions.safeParse(values).success;

  const validator = new SubstitutionValidator([schema], substitutions);
  const isCorrect = validator.validate();
  const validationMessages = isCorrect
    ? [tx('labels.info.substitutionsCorrect')]
    : validator.errors.map(error => describeSubstitutionError(error));

  return (
    <ModalForm
      header={tx('semantic.action.substitution')}
      submitText={tx('semantic.action.substitute')}
      canSubmit={isValid}
      validationHint={isValid ? '' : tx('labels.hint.substitutionsEmpty')}
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
            <ErrorField className='-mt-6 px-3' error={formatZodErrorMessage(field.state.meta.errors[0]?.message)} />
          </>
        )}
      </form.Field>
      <TextArea
        disabled
        value={validationMessages.join('\n')}
        rows={4}
        className='mt-3'
        areaClassName={isCorrect ? '' : 'border-accent-red-foreground border-2'}
      />
    </ModalForm>
  );
}
