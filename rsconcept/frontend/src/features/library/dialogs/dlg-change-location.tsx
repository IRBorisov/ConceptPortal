'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { PickLocation } from '../components/pick-location';
import { validateLocation } from '../models/library-api';

const schemaLocation = z.strictObject({
  location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation })
});

type LocationType = z.infer<typeof schemaLocation>;

export interface DlgChangeLocationProps {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

export function DlgChangeLocation() {
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
      header='Изменение расположения'
      submitText='Переместить'
      validationHint={
        isValid
          ? ''
          : `Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать ${limits.len_location}`
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
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
