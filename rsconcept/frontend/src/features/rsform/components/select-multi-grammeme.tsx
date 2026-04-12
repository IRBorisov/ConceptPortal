import { ComboMulti } from '@/components/input/combo-multi';
import { type Styling } from '@/components/props';
import { getCompatibleGrams, type Grammeme, supportedGrammemes } from '@/domain/cctext';
import { labelGrammeme } from '@/domain/cctext/labels';

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
