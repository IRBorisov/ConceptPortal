import clsx from 'clsx';

import { APP_COLORS } from '@/styling/colors';

import { colorFgGrammeme } from '../colors';
import { labelGrammeme } from '../labels';
import { type GramData } from '../models/language';

interface BadgeGrammemeProps {
  /** Grammeme to display. */
  grammeme: GramData;
}

/**
 * Displays a badge with a grammeme tag.
 */
export function BadgeGrammeme({ grammeme }: BadgeGrammemeProps) {
  return (
    <div
      className={clsx(
        'min-w-12', //
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
