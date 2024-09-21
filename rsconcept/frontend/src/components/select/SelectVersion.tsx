'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

import { IVersionInfo, VersionID } from '@/models/library';
import { labelVersion } from '@/utils/labels';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface SelectVersionProps extends CProps.Styling {
  id?: string;
  items?: IVersionInfo[];
  value?: VersionID;
  onSelectValue: (newValue?: VersionID) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectVersion({ id, className, items, value, onSelectValue, ...restProps }: SelectVersionProps) {
  const options = useMemo(() => {
    return [
      {
        value: undefined,
        label: labelVersion(undefined)
      },
      ...(items?.map(version => ({
        value: version.id,
        label: version.version
      })) ?? [])
    ];
  }, [items]);
  const valueLabel = useMemo(() => {
    const version = items?.find(ver => ver.id === value);
    return version ? version.version : labelVersion(undefined);
  }, [items, value]);

  return (
    <SelectSingle
      id={id}
      className={clsx('min-w-[12rem] text-ellipsis', className)}
      options={options}
      value={{ value: value, label: valueLabel }}
      onChange={data => onSelectValue(data?.value)}
      {...restProps}
    />
  );
}

export default SelectVersion;
