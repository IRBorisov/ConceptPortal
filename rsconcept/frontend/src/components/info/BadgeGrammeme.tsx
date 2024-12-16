import clsx from 'clsx';

import { GramData } from '@/models/language';
import { APP_COLORS, colorFgGrammeme } from '@/styling/color';
import { labelGrammeme } from '@/utils/labels';

interface BadgeGrammemeProps {
  /** Grammeme to display. */
  grammeme: GramData;
}

/**
 * Displays a badge with a grammeme tag.
 */
function BadgeGrammeme({ grammeme }: BadgeGrammemeProps) {
  return (
    <div
      className={clsx(
        'min-w-[3rem]', // prettier: split lines
        'px-1',
        'border rounded-md',
        'text-sm font-medium text-center whitespace-nowrap'
      )}
      style={{
        borderColor: colorFgGrammeme(grammeme),
        color: colorFgGrammeme(grammeme),
        backgroundColor: APP_COLORS.bgInput
      }}
    >
      {labelGrammeme(grammeme)}
    </div>
  );
}

export default BadgeGrammeme;
