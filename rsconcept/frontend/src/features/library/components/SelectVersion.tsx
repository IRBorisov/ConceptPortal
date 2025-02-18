'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { labelVersion } from '../../rsform/labels';
import { IVersionInfo } from '../backend/types';

interface SelectVersionProps extends CProps.Styling {
  id?: string;
  items?: IVersionInfo[];
  value?: number;
  onChange: (newValue?: number) => void;

  placeholder?: string;
  noBorder?: boolean;
}

export function SelectVersion({ id, className, items, value, onChange, ...restProps }: SelectVersionProps) {
  const options = [
    {
      value: undefined,
      label: labelVersion(undefined)
    },
    ...(items?.map(version => ({
      value: version.id,
      label: version.version
    })) ?? [])
  ];

  const valueLabel = (() => {
    const version = items?.find(ver => ver.id === value);
    return version ? version.version : labelVersion(undefined);
  })();

  return (
    <SelectSingle
      id={id}
      className={clsx('min-w-[12rem] text-ellipsis', className)}
      options={options}
      value={{ value: value, label: valueLabel }}
      onChange={data => onChange(data?.value)}
      {...restProps}
    />
  );
}
