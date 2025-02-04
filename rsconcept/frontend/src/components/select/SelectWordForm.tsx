'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { CProps } from '@/components/props';
import WordformButton from '@/dialogs/DlgEditReference/WordformButton';
import { Grammeme } from '@/models/language';
import { prefixes } from '@/utils/constants';
import { DefaultWordForms, IGrammemeOption, SelectorGrammemes } from '@/utils/selectors';

interface SelectWordFormProps extends CProps.Styling {
  value: IGrammemeOption[];
  onChange: React.Dispatch<React.SetStateAction<IGrammemeOption[]>>;
}

function SelectWordForm({ value, onChange, className, ...restProps }: SelectWordFormProps) {
  const handleSelect = useCallback(
    (grams: Grammeme[]) => {
      onChange(SelectorGrammemes.filter(({ value }) => grams.includes(value as Grammeme)));
    },
    [onChange]
  );

  return (
    <div className={clsx('text-xs sm:text-sm', className)} {...restProps}>
      {DefaultWordForms.slice(0, 12).map((data, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={data.text}
          example={data.example}
          grams={data.grams}
          isSelected={data.grams.every(gram => value.find(item => (item.value as Grammeme) === gram))}
          onSelectGrams={handleSelect}
        />
      ))}
    </div>
  );
}

export default SelectWordForm;
