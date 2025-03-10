'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuthSuspense } from '@/features/auth';

import { Label, TextArea } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { SelectLocationContext } from '../components/SelectLocationContext';
import { SelectLocationHead } from '../components/SelectLocationHead';
import { LocationHead } from '../models/library';
import { combineLocation, validateLocation } from '../models/libraryAPI';

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
  const { user } = useAuthSuspense();

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
      className='w-140 pb-3 px-6 flex gap-3 h-36'
    >
      <div className='flex flex-col gap-2 min-w-28'>
        <Label className='select-none' text='Корень' />
        <Controller
          control={control}
          name='location'
          render={({ field }) => (
            <SelectLocationHead
              value={field.value.substring(0, 2) as LocationHead}
              onChange={newValue => field.onChange(combineLocation(newValue, field.value.substring(3)))}
              excluded={!user.is_staff ? [LocationHead.LIBRARY] : []}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <SelectLocationContext dropdownHeight='max-h-36' value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <TextArea
            id='dlg_location'
            label='Путь'
            rows={3}
            value={field.value.substring(3)}
            onChange={event => field.onChange(combineLocation(field.value.substring(0, 2), event.target.value))}
            error={errors.location}
          />
        )}
      />
    </ModalForm>
  );
}
