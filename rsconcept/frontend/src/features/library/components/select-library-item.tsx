import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type ILibraryItem } from '../backend/types';

interface SelectLibraryItemProps extends Styling {
  id?: string;
  value: ILibraryItem | null;
  onChange: (newValue: ILibraryItem | null) => void;

  items?: ILibraryItem[];
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
