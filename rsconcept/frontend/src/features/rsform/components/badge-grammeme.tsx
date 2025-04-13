import { labelGrammeme } from '../labels';
import { type Grammeme } from '../models/language';

interface BadgeGrammemeProps {
  /** Grammeme to display. */
  grammeme: Grammeme;
}

/**
 * Displays a badge with a grammeme tag.
 */
export function BadgeGrammeme({ grammeme }: BadgeGrammemeProps) {
  return (
    <div className='min-w-12 px-1 border text-center whitespace-nowrap rounded-lg bg-card text-sm'>
      {labelGrammeme(grammeme)}
    </div>
  );
}
