'use client';

import { type LibraryItem } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';

import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

interface SelectLibraryItemProps extends Styling {
  id?: string;
  value: LibraryItem | null;
  onChange: (newValue: LibraryItem | null) => void;

  items?: LibraryItem[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectLibraryItem({ items, placeholder, ...restProps }: SelectLibraryItemProps) {
  const tx = useTx();
  const resolvedPlaceholder = placeholder ?? tx('ui.library.selectItem.placeholder', 'Select a schema');
  return (
    <ComboBox
      items={items}
      placeholder={resolvedPlaceholder}
      idFunc={item => String(item.id)}
      labelValueFunc={item => `${item.alias}: ${item.title}`}
      labelOptionFunc={item => `${item.alias}: ${item.title}`}
      {...restProps}
    />
  );
}
