import { type Grammeme } from '@/domain/cctext';
import { labelGrammeme } from '@/domain/cctext/labels';

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
