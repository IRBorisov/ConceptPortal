import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import { GramData } from '@/models/language';
import { colorfgGrammeme } from '@/utils/color';
import { labelGrammeme } from '@/utils/labels';

interface GrammemeBadgeProps {
  key?: string
  grammeme: GramData
}

function GrammemeBadge({ key, grammeme }: GrammemeBadgeProps) {
  const { colors } = useConceptTheme();
  return (
  <div
    key={key}
    className={clsx(
      'min-w-[3rem]',
      'px-1',
      'border rounded-md',
      'text-sm font-semibold text-center whitespace-nowrap'
    )}
    style={{
      borderColor: colorfgGrammeme(grammeme, colors),
      color: colorfgGrammeme(grammeme, colors), 
      backgroundColor: colors.bgInput
    }}
  >
    {labelGrammeme(grammeme)}
  </div>);
}

export default GrammemeBadge;