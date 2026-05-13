'use client';

import clsx from 'clsx';

import { LocationHead } from '@/domain/library';
import { combineLocation } from '@/domain/library/library-api';
import { useTx } from '@/i18n';

import { useAuth } from '@/features/auth';

import { ErrorField, Label, TextArea } from '@/components/input';
import { type Styling } from '@/components/props';

import { SelectLocationHead } from '../select-location-head';

import { SelectLocationContext } from './select-location-context';

interface PickLocationProps extends Styling {
  dropdownHeight?: string;
  rows?: number;

  value: string;
  onChange: (newLocation: string) => void;
  error?: string;
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
  const tx = useTx();
  const { user } = useAuth();

  return (
    <div className={clsx('flex flex-col relative', className)} {...restProps}>
      <SelectLocationHead
        className='absolute right-0 top-0'
        value={value.substring(0, 2) as LocationHead}
        onChange={newValue => onChange(combineLocation(newValue, value.substring(3)))}
        excluded={!user.is_staff ? [LocationHead.LIBRARY] : []}
      />

      <div className='relative flex gap-2 items-end h-6 mb-2 -mt-1 w-fit'>
        <Label text={tx('tx.lib.location')} htmlFor='dlg_location' />
        <SelectLocationContext dropdownHeight={dropdownHeight} value={value} onChange={onChange} />
      </div>
      <TextArea
        id='dlg_location'
        rows={rows}
        value={value.substring(3)}
        className='w-full'
        onChange={event => onChange(combineLocation(value.substring(0, 2), event.target.value))}
      />
      <ErrorField className='absolute bottom-1 right-4' error={error} />
    </div>
  );
}
