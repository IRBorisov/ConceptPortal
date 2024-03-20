'use client';

import { useMemo } from 'react';

import { IVersionInfo } from '@/models/library';
import { labelVersion } from '@/utils/labels';

import SelectSingle from '../ui/SelectSingle';

interface VersionSelectorProps {
  items?: IVersionInfo[];
  value?: number;
  onSelectValue: (newValue?: number) => void;
}

function VersionSelector({ items, value, onSelectValue }: VersionSelectorProps) {
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
      className='w-full min-w-[12rem] text-ellipsis'
      options={options}
      value={{ value: value, label: valueLabel }}
      onChange={data => onSelectValue(data?.value)}
    />
  );
}

export default VersionSelector;
