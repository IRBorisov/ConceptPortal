'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { labelVersion } from '../../rsform/labels';
import { IVersionInfo } from '../backend/types';
import { CurrentVersion } from '../models/library';

interface SelectVersionProps extends CProps.Styling {
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
      className={clsx('min-w-[12rem] text-ellipsis', className)}
      options={options}
      value={{ value: value, label: labelVersion(value, items) }}
      onChange={data => onChange(data?.value ?? 'latest')}
      {...restProps}
    />
  );
}
