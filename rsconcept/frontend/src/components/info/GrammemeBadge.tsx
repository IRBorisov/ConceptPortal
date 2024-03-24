import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import { GramData } from '@/models/language';
import { colorFgGrammeme } from '@/styling/color';
import { labelGrammeme } from '@/utils/labels';

interface GrammemeBadgeProps {
  grammeme: GramData;
}

function GrammemeBadge({ grammeme }: GrammemeBadgeProps) {
  const { colors } = useConceptTheme();
  return (
    <div
      className={clsx(
        'min-w-[3rem]', // prettier: split lines
        'px-1',
        'border rounded-md',
        'text-sm font-medium text-center whitespace-nowrap'
      )}
      style={{
        borderColor: colorFgGrammeme(grammeme, colors),
        color: colorFgGrammeme(grammeme, colors),
        backgroundColor: colors.bgInput
      }}
    >
      {labelGrammeme(grammeme)}
    </div>
  );
}

export default GrammemeBadge;
