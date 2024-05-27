import { useEffect, useState } from 'react';

import SelectMulti, { SelectMultiProps } from '@/components/ui/SelectMulti';
import { Grammeme } from '@/models/language';
import { getCompatibleGrams } from '@/models/languageAPI';
import { compareGrammemeOptions, IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

import { CProps } from '../props';

interface SelectMultiGrammemeProps
  extends Omit<SelectMultiProps<IGrammemeOption>, 'value' | 'onChange'>,
    CProps.Styling {
  value: IGrammemeOption[];
  setValue: React.Dispatch<React.SetStateAction<IGrammemeOption[]>>;
  placeholder?: string;
}

function SelectMultiGrammeme({ value, setValue, ...restProps }: SelectMultiGrammemeProps) {
  const [options, setOptions] = useState<IGrammemeOption[]>([]);

  useEffect(() => {
    const compatible = getCompatibleGrams(
      value.filter(data => Object.values(Grammeme).includes(data.value as Grammeme)).map(data => data.value as Grammeme)
    );
    setOptions(SelectorGrammemes.filter(({ value }) => compatible.includes(value as Grammeme)));
  }, [value]);

  return (
    <SelectMulti
      options={options}
      value={value}
      onChange={newValue => setValue([...newValue].sort(compareGrammemeOptions))}
      {...restProps}
    />
  );
}

export default SelectMultiGrammeme;
