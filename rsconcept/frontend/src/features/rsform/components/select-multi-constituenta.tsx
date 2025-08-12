import { ComboMulti } from '@/components/input/combo-multi';
import { type Styling } from '@/components/props';

import { labelConstituenta } from '../labels';
import { type IConstituenta } from '../models/rsform';

interface SelectMultiCstProps extends Styling {
  id?: string;
  value: IConstituenta[];
  items: IConstituenta[];
  onClear: () => void;
  onAdd: (item: IConstituenta) => void;
  onRemove: (item: IConstituenta) => void;

  placeholder?: string;
  disabled?: boolean;
}

export function SelectMultiConstituenta({ value, items, onClear, onAdd, onRemove, ...restProps }: SelectMultiCstProps) {
  return (
    <ComboMulti
      noSearch
      items={items}
      value={value}
      onClear={onClear}
      onAdd={onAdd}
      onRemove={onRemove}
      idFunc={cst => String(cst.id)}
      labelOptionFunc={cst => labelConstituenta(cst)}
      labelValueFunc={cst => cst.alias}
      {...restProps}
    />
  );
}
