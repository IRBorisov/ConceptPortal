import { useEffect, useState } from 'react';

import SelectMulti, { SelectMultiProps } from '@/components/Common/SelectMulti';
import { Grammeme } from '@/models/language';
import { getCompatibleGrams } from '@/models/languageAPI';
import { compareGrammemeOptions,IGrammemeOption, SelectorGrammems } from '@/utils/selectors';

interface SelectGrammemeProps extends
Omit<SelectMultiProps<IGrammemeOption>, 'value' | 'onChange'> {
  value: IGrammemeOption[]
  setValue: React.Dispatch<React.SetStateAction<IGrammemeOption[]>>
  dimensions?: string
  className?: string
  placeholder?: string
}

function SelectGrammeme({
  value, setValue,
  dimensions, className, placeholder
}: SelectGrammemeProps) {
  const [options, setOptions] = useState<IGrammemeOption[]>([]);

  useEffect(
  () => {
    const compatible = getCompatibleGrams(
      value
        .filter(data => Object.values(Grammeme).includes(data.value as Grammeme))
        .map(data => data.value as Grammeme)
    );
    setOptions(SelectorGrammems.filter(({value}) => compatible.includes(value as Grammeme)));
  }, [value]);

  return (
  <SelectMulti
    className={`${dimensions} ${className}`}
    options={options}
    placeholder={placeholder}
    value={value}
    onChange={newValue => setValue([...newValue].sort(compareGrammemeOptions))}
  />);
}

export default SelectGrammeme;