import { type Styling } from '@/components/props';
import { ComboMulti } from '@/components/ui/combo-multi';

import { labelGrammeme } from '../labels';
import { type Grammeme, supportedGrammemes } from '../models/language';
import { getCompatibleGrams } from '../models/language-api';

interface SelectMultiGrammemeProps extends Styling {
  id?: string;
  value: Grammeme[];
  onChange: (newValue: Grammeme[]) => void;
  placeholder?: string;
}

export function SelectMultiGrammeme({ value, onChange, ...restProps }: SelectMultiGrammemeProps) {
  const compatible = getCompatibleGrams(value);
  const items: Grammeme[] = [...supportedGrammemes.filter(gram => compatible.includes(gram))];

  return (
    <ComboMulti
      noSearch
      items={items}
      value={value}
      onChange={onChange}
      idFunc={gram => gram}
      labelOptionFunc={gram => labelGrammeme(gram)}
      labelValueFunc={gram => labelGrammeme(gram)}
      {...restProps}
    />
  );
}
