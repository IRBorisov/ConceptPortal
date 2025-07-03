import { ComboBox } from '@/components/input/combo-box';

import { describeConstituenta, describeConstituentaTerm } from '../labels';
import { type IConstituenta } from '../models/rsform';

interface SelectConstituentaProps {
  id?: string;
  value: IConstituenta | null;
  onChange: (newValue: IConstituenta | null) => void;

  className?: string;
  items?: IConstituenta[];
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
