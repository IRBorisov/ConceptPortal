'use client';

import { type FieldError } from 'react-hook-form';
import clsx from 'clsx';

import { useAuthSuspense } from '@/features/auth';

import { ErrorField, TextArea } from '@/components/input';
import { type Styling } from '@/components/props';

import { LocationHead } from '../../models/library';
import { combineLocation } from '../../models/library-api';
import { SelectLocationHead } from '../select-location-head';

import { SelectLocationContext } from './select-location-context';

interface PickLocationProps extends Styling {
  dropdownHeight?: string;
  rows?: number;

  value: string;
  onChange: (newLocation: string) => void;
  error?: FieldError;
}

export function PickLocation({
  dropdownHeight,
  rows = 3,
  value,
  onChange,
  error,
  className,
  ...restProps
}: PickLocationProps) {
  const { user } = useAuthSuspense();

  return (
    <div className={clsx('flex relative', className)} {...restProps}>
      <SelectLocationHead
        className='absolute right-0 top-0'
        value={value.substring(0, 2) as LocationHead}
        onChange={newValue => onChange(combineLocation(newValue, value.substring(3)))}
        excluded={!user.is_staff ? [LocationHead.LIBRARY] : []}
      />

      <SelectLocationContext
        className='absolute left-28 -top-1'
        dropdownHeight={dropdownHeight} //
        value={value}
        onChange={onChange}
      />

      <TextArea
        id='dlg_location'
        label='Расположение'
        rows={rows}
        value={value.substring(3)}
        onChange={event => onChange(combineLocation(value.substring(0, 2), event.target.value))}
      />
      <ErrorField className='absolute bottom-1 right-4' error={error} />
    </div>
  );
}
