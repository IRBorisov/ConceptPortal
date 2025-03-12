'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/input1';
import { type Styling } from '@/components/props';

import { labelVersion } from '../../rsform/labels';
import { type IVersionInfo } from '../backend/types';
import { type CurrentVersion } from '../models/library';

interface SelectVersionProps extends Styling {
  id?: string;
  value: CurrentVersion;
  onChange: (newValue: CurrentVersion) => void;

  items: IVersionInfo[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectVersion({ id, className, items, value, onChange, ...restProps }: SelectVersionProps) {
  const options = [
    {
      value: 'latest' as const,
      label: labelVersion('latest', items)
    },
    ...(items?.map(version => ({
      value: version.id,
      label: version.version
    })) ?? [])
  ];

  return (
    <SelectSingle
      id={id}
      className={clsx('min-w-48 text-ellipsis', className)}
      options={options}
      value={{ value: value, label: labelVersion(value, items) }}
      onChange={data => onChange(data?.value ?? 'latest')}
      {...restProps}
    />
  );
}
