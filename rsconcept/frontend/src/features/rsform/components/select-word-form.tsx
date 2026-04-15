'use client';

import { Grammeme, supportedGrammemes } from '@/domain/cctext';

import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { WordformButton } from './wordform-button';

function prepareExample(question: string, answer: string) {
  return `${question}<br/><div class="text-center"><b>${answer}</b></div>`;
}

/** Represents recommended wordforms data. */
export const DefaultWordForms = [
  {
    text: 'ед им',
    example: prepareExample('Кто? Что?', 'ручка'),
    grams: [Grammeme.sing, Grammeme.nomn]
  },
  { text: 'ед род', example: prepareExample('Кого? Чего?', 'ручки'), grams: [Grammeme.sing, Grammeme.gent] },
  { text: 'ед дат', example: prepareExample('Кому? Чему?', 'ручке'), grams: [Grammeme.sing, Grammeme.datv] },
  { text: 'ед вин', example: prepareExample('Кого? Что?', 'ручку'), grams: [Grammeme.sing, Grammeme.accs] },
  { text: 'ед твор', example: prepareExample('Кем? Чем?', 'ручкой'), grams: [Grammeme.sing, Grammeme.ablt] },
  { text: 'ед пред', example: prepareExample('О ком? О чём?', 'о ручке'), grams: [Grammeme.sing, Grammeme.loct] },

  { text: 'мн им', example: prepareExample('Кто? Что?', 'ручки'), grams: [Grammeme.plur, Grammeme.nomn] },
  { text: 'мн род', example: prepareExample('Кого? Чего?', 'ручек'), grams: [Grammeme.plur, Grammeme.gent] },
  { text: 'мн дат', example: prepareExample('Кому? Чему?', 'ручкам'), grams: [Grammeme.plur, Grammeme.datv] },
  { text: 'мн вин', example: prepareExample('Кого? Что?', 'ручки'), grams: [Grammeme.plur, Grammeme.accs] },
  { text: 'мн твор', example: prepareExample('Кем? Чем?', 'ручками'), grams: [Grammeme.plur, Grammeme.ablt] },
  { text: 'мн пред', example: prepareExample('О ком? О чём?', 'о ручках'), grams: [Grammeme.plur, Grammeme.loct] }
] as const;

interface SelectWordFormProps extends Styling {
  value: Grammeme[];
  onChange: React.Dispatch<React.SetStateAction<Grammeme[]>>;
  onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SelectWordForm({ value, onChange, className, onDoubleClick, ...restProps }: SelectWordFormProps) {
  function handleSelect(grams: Grammeme[]) {
    onChange(supportedGrammemes.filter(value => grams.includes(value)));
  }

  return (
    <div className={cn('text-xs grid grid-cols-6', className)} {...restProps}>
      {DefaultWordForms.slice(0, 12).map((data, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={data.text}
          example={data.example}
          grams={data.grams}
          isSelected={data.grams.every(gram => value.find(item => item === gram))}
          onSelectGrams={handleSelect}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </div>
  );
}
