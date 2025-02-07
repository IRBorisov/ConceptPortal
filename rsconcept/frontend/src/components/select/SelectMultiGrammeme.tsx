import { CProps } from '@/components/props';
import { SelectMulti, SelectMultiProps } from '@/components/ui/Input';
import { Grammeme } from '@/models/language';
import { getCompatibleGrams } from '@/models/languageAPI';
import { compareGrammemeOptions, IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

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
  const options = SelectorGrammemes.filter(({ value }) => compatible.includes(value as Grammeme));

  return (
    <SelectMulti
      options={options}
      value={value}
      onChange={newValue => onChange([...newValue].sort(compareGrammemeOptions))}
      {...restProps}
    />
  );
}

export default SelectMultiGrammeme;
