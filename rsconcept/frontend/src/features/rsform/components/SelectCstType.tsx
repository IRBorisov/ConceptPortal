import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { labelCstType } from '../labels';
import { CstType } from '../models/rsform';

const SelectorCstType = Object.values(CstType).map(typeStr => ({
  value: typeStr as CstType,
  label: labelCstType(typeStr as CstType)
}));

interface SelectCstTypeProps extends CProps.Styling {
  id?: string;
  disabled?: boolean;
  value: CstType;
  onChange: (newValue: CstType) => void;
}

export function SelectCstType({ value, onChange, disabled = false, ...restProps }: SelectCstTypeProps) {
  return (
    <SelectSingle
      id='dlg_cst_type'
      placeholder='Выберите тип'
      options={SelectorCstType}
      value={{ value: value, label: labelCstType(value) }}
      onChange={data => onChange(data?.value ?? CstType.BASE)}
      isDisabled={disabled}
      {...restProps}
    />
  );
}
