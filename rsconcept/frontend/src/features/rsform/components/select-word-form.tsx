'use client';

import { Grammeme, supportedGrammemes } from '@/domain/cctext';

import { useTx } from '@/app/i18n/use-tx';

import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { WordformButton } from './wordform-button';

function prepareExample(question: string, answer: string) {
  return `${question}<br/><div class="text-center"><b>${answer}</b></div>`;
}

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

const EN_ABBR: Record<WordFormRowKey, string> = {
  singNomn: 'Sg nom',
  singGent: 'Sg gen',
  singDatv: 'Sg dat',
  singAccs: 'Sg acc',
  singAblt: 'Sg ins',
  singLoct: 'Sg loc',
  plurNomn: 'Pl nom',
  plurGent: 'Pl gen',
  plurDatv: 'Pl dat',
  plurAccs: 'Pl acc',
  plurAblt: 'Pl ins',
  plurLoct: 'Pl loc'
};

const EN_EXAMPLE: Record<WordFormRowKey, string> = {
  singNomn: prepareExample('Who? What?', 'pen'),
  singGent: prepareExample('Of whom? Of what?', 'pen'),
  singDatv: prepareExample('To whom? To what?', 'pen'),
  singAccs: prepareExample('Whom? What?', 'pen'),
  singAblt: prepareExample('By whom? With what?', 'pen'),
  singLoct: prepareExample('About whom? About what?', 'pen'),
  plurNomn: prepareExample('Who? What?', 'pens'),
  plurGent: prepareExample('Of whom? Of what?', 'pens'),
  plurDatv: prepareExample('To whom? To what?', 'pens'),
  plurAccs: prepareExample('Whom? What?', 'pens'),
  plurAblt: prepareExample('By whom? With what?', 'pens'),
  plurLoct: prepareExample('About whom? About what?', 'pens')
};

interface SelectWordFormProps extends Styling {
  value: Grammeme[];
  onChange: React.Dispatch<React.SetStateAction<Grammeme[]>>;
  onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SelectWordForm({ value, onChange, className, onDoubleClick, ...restProps }: SelectWordFormProps) {
  const tx = useTx();

  function handleSelect(grams: Grammeme[]) {
    onChange(supportedGrammemes.filter(value => grams.includes(value)));
  }

  return (
    <div className={cn('text-xs grid grid-cols-6', className)} {...restProps}>
      {WORD_FORM_ROW_DEFS.map((row, index) => (
        <WordformButton
          key={`${prefixes.wordform_list}${index}`}
          text={tx(`ui.wordForms.abbr.${row.rowKey}`, EN_ABBR[row.rowKey])}
          example={tx(`ui.wordForms.example.${row.rowKey}`, EN_EXAMPLE[row.rowKey])}
          grams={row.grams}
          isSelected={row.grams.every(gram => value.find(item => item === gram))}
          onSelectGrams={handleSelect}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </div>
  );
}
