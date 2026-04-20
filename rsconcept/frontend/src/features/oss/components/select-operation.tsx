import { type Operation } from '@/domain/library';

import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

interface SelectOperationProps extends Styling {
  id?: string;
  value: Operation | null;
  onChange: (newValue: Operation | null) => void;
  className?: string;

  items?: Operation[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectOperation({ items, placeholder = 'Выбор операции', ...restProps }: SelectOperationProps) {
  return (
    <ComboBox
      items={items}
      placeholder={placeholder}
      idFunc={operation => String(operation.id)}
      labelValueFunc={operation => `${operation.alias}: ${operation.title}`}
      labelOptionFunc={operation => `${operation.alias}: ${operation.title}`}
      {...restProps}
    />
  );
}
