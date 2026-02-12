import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type LibraryItem } from '../backend/types';

interface SelectLibraryItemProps extends Styling {
  id?: string;
  value: LibraryItem | null;
  onChange: (newValue: LibraryItem | null) => void;

  items?: LibraryItem[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectLibraryItem({ items, placeholder = 'Выберите схему', ...restProps }: SelectLibraryItemProps) {
  return (
    <ComboBox
      items={items}
      placeholder={placeholder}
      idFunc={item => String(item.id)}
      labelValueFunc={item => `${item.alias}: ${item.title}`}
      labelOptionFunc={item => `${item.alias}: ${item.title}`}
      {...restProps}
    />
  );
}
