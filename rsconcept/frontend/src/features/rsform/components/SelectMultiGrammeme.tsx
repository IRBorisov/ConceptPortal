import { SelectMulti, type SelectMultiProps } from '@/components/Input';
import { type Styling } from '@/components/props';

import { Grammeme, type IGrammemeOption } from '../models/language';
import { getCompatibleGrams, grammemeCompare, supportedGrammeOptions } from '../models/languageAPI';

interface SelectMultiGrammemeProps extends Omit<SelectMultiProps<IGrammemeOption>, 'value' | 'onChange'>, Styling {
  value: IGrammemeOption[];
  onChange: (newValue: IGrammemeOption[]) => void;
  placeholder?: string;
}

export function SelectMultiGrammeme({ value, onChange, ...restProps }: SelectMultiGrammemeProps) {
  const compatible = getCompatibleGrams(
    value.filter(data => Object.values(Grammeme).includes(data.value as Grammeme)).map(data => data.value as Grammeme)
  );
  const options = supportedGrammeOptions.filter(({ value }) => compatible.includes(value as Grammeme));

  return (
    <SelectMulti
      options={options}
      value={value}
      onChange={newValue => onChange([...newValue].sort((left, right) => grammemeCompare(left.value, right.value)))}
      {...restProps}
    />
  );
}
