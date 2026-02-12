import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type Block } from '../models/oss';

interface SelectBlockProps extends Styling {
  id?: string;
  value: Block | null;
  onChange: (newValue: Block | null) => void;

  items?: Block[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectBlock({ items, placeholder = 'Выбор блока', ...restProps }: SelectBlockProps) {
  return (
    <ComboBox
      items={items}
      clearable
      placeholder={placeholder}
      idFunc={block => String(block.id)}
      labelValueFunc={block => block.title}
      labelOptionFunc={block => block.title}
      {...restProps}
    />
  );
}
