'use client';

import { useCallback } from 'react';

import { Grammeme } from '@/models/language';
import { prefixes } from '@/utils/constants';
import { DefaultWordForms, IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

import WordformButton from './WordformButton';

interface SelectWordFormProps {
  selected: IGrammemeOption[];
  setSelected: React.Dispatch<React.SetStateAction<IGrammemeOption[]>>;
}

function SelectWordForm({ selected, setSelected }: SelectWordFormProps) {
  const handleSelect = useCallback(
    (grams: Grammeme[]) => {
      setSelected(SelectorGrammemes.filter(({ value }) => grams.includes(value as Grammeme)));
    },
    [setSelected]
  );

  return (
    <div className='text-sm'>
      {DefaultWordForms.slice(0, 12).map((data, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={data.text}
          example={data.example}
          grams={data.grams}
          isSelected={data.grams.every(gram => selected.find(item => (item.value as Grammeme) === gram))}
          onSelectGrams={handleSelect}
        />
      ))}
    </div>
  );
}

export default SelectWordForm;
