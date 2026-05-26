'use client';

import { Grammeme, supportedGrammemes } from '@rsconcept/domain/cctext';

import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { WordformButton, type WordformExample } from './wordform-button';

/** Grammatical word-form rows (singular/plural × six cases) for pickers and word-form dialog keys. */
export const WORD_FORM_ROW_DEFS = [
  { rowKey: 'singNomn', grams: [Grammeme.sing, Grammeme.nomn] },
  { rowKey: 'singGent', grams: [Grammeme.sing, Grammeme.gent] },
  { rowKey: 'singDatv', grams: [Grammeme.sing, Grammeme.datv] },
  { rowKey: 'singAccs', grams: [Grammeme.sing, Grammeme.accs] },
  { rowKey: 'singAblt', grams: [Grammeme.sing, Grammeme.ablt] },
  { rowKey: 'singLoct', grams: [Grammeme.sing, Grammeme.loct] },
  { rowKey: 'plurNomn', grams: [Grammeme.plur, Grammeme.nomn] },
  { rowKey: 'plurGent', grams: [Grammeme.plur, Grammeme.gent] },
  { rowKey: 'plurDatv', grams: [Grammeme.plur, Grammeme.datv] },
  { rowKey: 'plurAccs', grams: [Grammeme.plur, Grammeme.accs] },
  { rowKey: 'plurAblt', grams: [Grammeme.plur, Grammeme.ablt] },
  { rowKey: 'plurLoct', grams: [Grammeme.plur, Grammeme.loct] }
] as const;

type WordFormRowKey = (typeof WORD_FORM_ROW_DEFS)[number]['rowKey'];

export const RUSSIAN_WORD_FORM_CASE_HINTS = {
  nomn: 'Именительный: Кто? Что?',
  gent: 'Родительный: Кого? Чего?',
  datv: 'Дательный: Кому? Чему?',
  accs: 'Винительный: Кого? Что?',
  ablt: 'Творительный: Кем? Чем?',
  loct: 'Предложный: О ком? О чём?'
} as const;

export const RUSSIAN_WORD_FORM_NUMBER_LABELS = {
  singular: 'Единственное число',
  plural: 'Множественное число'
} as const;

const RUSSIAN_WORD_FORM_ABBR: Record<WordFormRowKey, string> = {
  singNomn: 'ед им',
  singGent: 'ед род',
  singDatv: 'ед дат',
  singAccs: 'ед вин',
  singAblt: 'ед твор',
  singLoct: 'ед пред',
  plurNomn: 'мн им',
  plurGent: 'мн род',
  plurDatv: 'мн дат',
  plurAccs: 'мн вин',
  plurAblt: 'мн твор',
  plurLoct: 'мн пред'
};

const RUSSIAN_WORD_FORM_EXAMPLE: Record<WordFormRowKey, WordformExample> = {
  singNomn: { question: 'Кто? Что?', answer: 'ручка' },
  singGent: { question: 'Кого? Чего?', answer: 'ручки' },
  singDatv: { question: 'Кому? Чему?', answer: 'ручке' },
  singAccs: { question: 'Кого? Что?', answer: 'ручку' },
  singAblt: { question: 'Кем? Чем?', answer: 'ручкой' },
  singLoct: { question: 'О ком? О чём?', answer: 'о ручке' },
  plurNomn: { question: 'Кто? Что?', answer: 'ручки' },
  plurGent: { question: 'Кого? Чего?', answer: 'ручек' },
  plurDatv: { question: 'Кому? Чему?', answer: 'ручкам' },
  plurAccs: { question: 'Кого? Что?', answer: 'ручки' },
  plurAblt: { question: 'Кем? Чем?', answer: 'ручками' },
  plurLoct: { question: 'О ком? О чём?', answer: 'о ручках' }
};

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
      {WORD_FORM_ROW_DEFS.map((row, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={RUSSIAN_WORD_FORM_ABBR[row.rowKey]}
          example={RUSSIAN_WORD_FORM_EXAMPLE[row.rowKey]}
          grams={row.grams}
          isSelected={row.grams.every(gram => value.find(item => item === gram))}
          onSelectGrams={handleSelect}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </div>
  );
}
