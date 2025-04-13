import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type IOperation } from '../models/oss';

interface SelectOperationProps extends Styling {
  id?: string;
  value: IOperation | null;
  onChange: (newValue: IOperation | null) => void;

  items?: IOperation[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectOperation({ items, placeholder = 'Выберите операцию', ...restProps }: SelectOperationProps) {
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
