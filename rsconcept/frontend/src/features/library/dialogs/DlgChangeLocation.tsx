'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Label, TextArea } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useAuthSuspense } from '@/features/auth';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import SelectLocationContext from '../components/SelectLocationContext';
import SelectLocationHead from '../components/SelectLocationHead';
import { LocationHead } from '../models/library';
import { combineLocation, validateLocation } from '../models/libraryAPI';

const schemaLocation = z.object({
  location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation })
});

type ILocationType = z.infer<typeof schemaLocation>;

export interface DlgChangeLocationProps {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

function DlgChangeLocation() {
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
      className={clsx('w-[35rem]', 'pb-3 px-6 flex gap-3 h-[9rem]')}
    >
      <div className='flex flex-col gap-2 min-w-[7rem] h-min'>
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
          <SelectLocationContext className='max-h-[9.2rem]' value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control} //
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

export default DlgChangeLocation;
