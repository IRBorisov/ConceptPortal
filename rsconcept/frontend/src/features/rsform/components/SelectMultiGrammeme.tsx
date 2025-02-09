import { SelectMulti, SelectMultiProps } from '@/components/Input';
import { CProps } from '@/components/props';

import { Grammeme, IGrammemeOption } from '../models/language';
import { getCompatibleGrams, grammemeCompare, supportedGrammeOptions } from '../models/languageAPI';

interface SelectMultiGrammemeProps
  extends Omit<SelectMultiProps<IGrammemeOption>, 'value' | 'onChange'>,
    CProps.Styling {
  value: IGrammemeOption[];
  onChange: (newValue: IGrammemeOption[]) => void;
  placeholder?: string;
}

function SelectMultiGrammeme({ value, onChange, ...restProps }: SelectMultiGrammemeProps) {
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

export default SelectMultiGrammeme;
