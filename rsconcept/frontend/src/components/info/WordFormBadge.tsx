import { IWordForm } from '@/models/language';

import GrammemeBadge from './GrammemeBadge';

interface WordFormBadgeProps {
  keyPrefix?: string;
  form: IWordForm;
}

function WordFormBadge({ keyPrefix, form }: WordFormBadgeProps) {
  return (
    <div className='flex flex-wrap justify-start gap-1 select-none'>
      {form.grams.map(gram => (
        <GrammemeBadge key={`${keyPrefix}-${gram}`} grammeme={gram} />
      ))}
    </div>
  );
}

export default WordFormBadge;
