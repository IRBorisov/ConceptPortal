import { ComboBox } from '@/components/input/combo-box';

import { describeConstituenta, describeConstituentaTerm } from '../labels';
import { type Constituenta } from '../models/rsform';

interface SelectConstituentaProps {
  id?: string;
  value: Constituenta | null;
  onChange: (newValue: Constituenta | null) => void;

  className?: string;
  items?: Constituenta[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectConstituenta({
  items,
  placeholder = 'Выбор конституенты',
  ...restProps
}: SelectConstituentaProps) {
  return (
    <ComboBox
      items={items}
      placeholder={placeholder}
      idFunc={cst => String(cst.id)}
      labelValueFunc={cst => `${cst.alias}: ${describeConstituentaTerm(cst)}`}
      labelOptionFunc={cst => `${cst.alias}${cst.is_inherited ? '*' : ''}: ${describeConstituenta(cst)}`}
      {...restProps}
    />
  );
}
