'use client';

import clsx from 'clsx';

import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { Grammeme, supportedGrammemes } from '../models/language';

import { WordformButton } from './wordform-button';

/**
 * Represents recommended wordforms data.
 */
const DefaultWordForms = [
  { text: 'ед им', example: 'ручка', grams: [Grammeme.sing, Grammeme.nomn] },
  { text: 'ед род', example: 'ручки', grams: [Grammeme.sing, Grammeme.gent] },
  { text: 'ед дат', example: 'ручке', grams: [Grammeme.sing, Grammeme.datv] },
  { text: 'ед вин', example: 'ручку', grams: [Grammeme.sing, Grammeme.accs] },
  { text: 'ед твор', example: 'ручкой', grams: [Grammeme.sing, Grammeme.ablt] },
  { text: 'ед пред', example: 'ручке', grams: [Grammeme.sing, Grammeme.loct] },

  { text: 'мн им', example: 'ручки', grams: [Grammeme.plur, Grammeme.nomn] },
  { text: 'мн род', example: 'ручек', grams: [Grammeme.plur, Grammeme.gent] },
  { text: 'мн дат', example: 'ручкам', grams: [Grammeme.plur, Grammeme.datv] },
  { text: 'мн вин', example: 'ручки', grams: [Grammeme.plur, Grammeme.accs] },
  { text: 'мн твор', example: 'ручками', grams: [Grammeme.plur, Grammeme.ablt] },
  { text: 'мн пред', example: 'ручках', grams: [Grammeme.plur, Grammeme.loct] }
] as const;

interface SelectWordFormProps extends Styling {
  value: Grammeme[];
  onChange: React.Dispatch<React.SetStateAction<Grammeme[]>>;
}

export function SelectWordForm({ value, onChange, className, ...restProps }: SelectWordFormProps) {
  function handleSelect(grams: Grammeme[]) {
    onChange(supportedGrammemes.filter(value => grams.includes(value)));
  }

  return (
    <div className={clsx('text-xs sm:text-sm grid grid-cols-6', className)} {...restProps}>
      {DefaultWordForms.slice(0, 12).map((data, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={data.text}
          example={data.example}
          grams={data.grams}
          isSelected={data.grams.every(gram => value.find(item => item === gram))}
          onSelectGrams={handleSelect}
        />
      ))}
    </div>
  );
}
