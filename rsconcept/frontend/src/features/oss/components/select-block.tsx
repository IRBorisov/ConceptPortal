import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type IBlock } from '../models/oss';

interface SelectBlockProps extends Styling {
  id?: string;
  value: IBlock | null;
  onChange: (newValue: IBlock | null) => void;

  items?: IBlock[];
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
