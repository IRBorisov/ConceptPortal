'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

import { validateLocation } from '@/domain/library/library-api';
import { formatZodErrorMessage, lid, useTx } from '@/i18n';

import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';

import { PickLocation } from '../components/pick-location';

const schemaLocation = z.strictObject({
  location: z.string().refine(data => validateLocation(data), { message: lid.error.invalidLocation })
});

type LocationType = z.infer<typeof schemaLocation>;

export interface DlgChangeLocationProps {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

export function DlgChangeLocation() {
  const tx = useTx();
  const { initial, onChangeLocation } = useDialogsStore(state => state.props as DlgChangeLocationProps);

  const form = useForm({
    defaultValues: {
      location: initial
    } satisfies LocationType,
    validators: {
      onChange: schemaLocation
    },
    onSubmit: ({ value }) => {
      onChangeLocation(value.location);
    }
  });

  const values = useStore(form.store, state => state.values);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);
  const isValid = useMemo(() => schemaLocation.safeParse(values).success, [values]);

  return (
    <ModalForm
      overflowVisible
      header={tx('ui.dlg.changeLocation.header')}
      submitText={tx('ui.action.move')}
      validationHint={
        isValid
          ? ''
          : tx('ui.dlg.changeLocation.invalidHint', { maxLen: limits.len_location })
      }
      canSubmit={isValid && !isDefaultValue}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-130 pb-3 px-6 h-36'
    >
      <form.Field name='location'>
        {field => (
          <PickLocation
            dropdownHeight='h-38' //
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
