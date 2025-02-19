import { IWordForm } from '../models/language';

import { BadgeGrammeme } from './BadgeGrammeme';

interface BadgeWordFormProps {
  /** Word form to display. */
  form: IWordForm;

  /** Prefix for grammemes keys. */
  keyPrefix?: string;
}

/**
 * Displays a badge with grammemes of a word form.
 */
export function BadgeWordForm({ keyPrefix, form }: BadgeWordFormProps) {
  return (
    <div className='flex flex-wrap justify-start gap-1 select-none w-fit'>
      {form.grams.map(gram => (
        <BadgeGrammeme key={`${keyPrefix}-${gram}`} grammeme={gram} />
      ))}
    </div>
  );
}
