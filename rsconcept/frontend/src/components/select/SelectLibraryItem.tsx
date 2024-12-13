'use client';

import clsx from 'clsx';

import { ILibraryItem, LibraryItemID } from '@/models/library';
import { matchLibraryItem } from '@/models/libraryAPI';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface SelectLibraryItemProps extends CProps.Styling {
  items?: ILibraryItem[];
  value?: ILibraryItem;
  onSelectValue: (newValue?: ILibraryItem) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectLibraryItem({
  className,
  items,
  value,
  onSelectValue,
  placeholder = 'Выберите схему',
  ...restProps
}: SelectLibraryItemProps) {
  const options =
    items?.map(cst => ({
      value: cst.id,
      label: `${cst.alias}: ${cst.title}`
    })) ?? [];

  function filter(option: { value: LibraryItemID | undefined; label: string }, inputValue: string) {
    const item = items?.find(item => item.id === option.value);
    return !item ? false : matchLibraryItem(item, inputValue);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${value.title}` } : null}
      onChange={data => onSelectValue(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectLibraryItem;
