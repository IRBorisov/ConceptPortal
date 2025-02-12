'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { ILibraryItem } from '../models/library';
import { matchLibraryItem } from '../models/libraryAPI';

interface SelectLibraryItemProps extends CProps.Styling {
  items?: ILibraryItem[];
  value?: ILibraryItem;
  onChange: (newValue?: ILibraryItem) => void;

  placeholder?: string;
  noBorder?: boolean;
}

export function SelectLibraryItem({
  className,
  items,
  value,
  onChange,
  placeholder = 'Выберите схему',
  ...restProps
}: SelectLibraryItemProps) {
  const options =
    items?.map(cst => ({
      value: cst.id,
      label: `${cst.alias}: ${cst.title}`
    })) ?? [];

  function filter(option: { value: number | undefined; label: string }, inputValue: string) {
    const item = items?.find(item => item.id === option.value);
    return !item ? false : matchLibraryItem(item, inputValue);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${value.title}` } : null}
      onChange={data => onChange(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}
