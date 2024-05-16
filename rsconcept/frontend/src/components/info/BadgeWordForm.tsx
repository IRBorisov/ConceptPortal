import { IWordForm } from '@/models/language';

import BadgeGrammeme from './BadgeGrammeme';

interface BadgeWordFormProps {
  keyPrefix?: string;
  form: IWordForm;
}

function BadgeWordForm({ keyPrefix, form }: BadgeWordFormProps) {
  return (
    <div className='flex flex-wrap justify-start gap-1 select-none'>
      {form.grams.map(gram => (
        <BadgeGrammeme key={`${keyPrefix}-${gram}`} grammeme={gram} />
      ))}
    </div>
  );
}

export default BadgeWordForm;
