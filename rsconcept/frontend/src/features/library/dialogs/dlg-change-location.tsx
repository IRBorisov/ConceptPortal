'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

type ILocationType = z.infer<typeof schemaLocation>;

export interface DlgChangeLocationProps {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

export function DlgChangeLocation() {
  const { initial, onChangeLocation } = useDialogsStore(state => state.props as DlgChangeLocationProps);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty }
  } = useForm<ILocationType>({
    resolver: zodResolver(schemaLocation),
    defaultValues: {
      location: initial
    },
    mode: 'onChange'
  });

  function onSubmit(data: ILocationType) {
    onChangeLocation(data.location);
  }

  return (
    <ModalForm
      overflowVisible
      header='Изменение расположения'
      submitText='Переместить'
      submitInvalidTooltip={`Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать ${limits.location_len}`}
      canSubmit={isValid && isDirty}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-130 pb-3 px-6 h-36'
    >
      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <PickLocation
            dropdownHeight='h-38' //
            value={field.value}
            onChange={field.onChange}
            error={errors.location}
          />
        )}
      />
    </ModalForm>
  );
}
