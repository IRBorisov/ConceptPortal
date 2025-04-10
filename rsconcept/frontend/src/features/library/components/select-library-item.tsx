'use client';

import { type Styling } from '@/components/props';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { type ILibraryItem } from '../backend/types';

interface SelectLibraryItemProps extends Styling {
  id?: string;
  value: ILibraryItem | null;
  onChange: (newValue: ILibraryItem | null) => void;

  items?: ILibraryItem[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectLibraryItem({
  id,
  items,
  value,
  onChange,
  placeholder = 'Выберите схему',
  ...restProps
}: SelectLibraryItemProps) {
  function handleSelect(newValue: string) {
    const newItem = items?.find(item => item.id === Number(newValue)) ?? null;
    onChange(newItem);
  }

  return (
    <Select onValueChange={handleSelect} defaultValue={value ? String(value.id) : undefined}>
      <SelectTrigger id={id} {...restProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='max-w-80'>
        {items?.map(item => (
          <SelectItem key={`${id ?? 'default'}-item-select-${item.id}`} value={String(item.id)}>
            {`${item.alias}: ${item.title}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
