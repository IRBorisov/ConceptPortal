import { colorFgGrammeme } from '../colors';
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
    <div
      className='min-w-12 px-1 border rounded-md text-sm font-medium text-center whitespace-nowrap bg-prim-0'
      style={{
        borderColor: colorFgGrammeme(grammeme),
        color: colorFgGrammeme(grammeme)
      }}
    >
      {labelGrammeme(grammeme)}
    </div>
  );
}
