'use client';

import clsx from 'clsx';

import { CProps } from '@/components/props';
import SelectSingle from '@/components/ui/SelectSingle';
import { IVersionInfo, VersionID } from '@/models/library';
import { labelVersion } from '@/utils/labels';

interface SelectVersionProps extends CProps.Styling {
  id?: string;
  items?: IVersionInfo[];
  value?: VersionID;
  onSelectValue: (newValue?: VersionID) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectVersion({ id, className, items, value, onSelectValue, ...restProps }: SelectVersionProps) {
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
      onChange={data => onSelectValue(data?.value)}
      {...restProps}
    />
  );
}

export default SelectVersion;
