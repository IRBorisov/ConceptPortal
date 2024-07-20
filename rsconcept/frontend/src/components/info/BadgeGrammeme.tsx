import clsx from 'clsx';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { GramData } from '@/models/language';
import { colorFgGrammeme } from '@/styling/color';
import { labelGrammeme } from '@/utils/labels';

interface BadgeGrammemeProps {
  grammeme: GramData;
}

function BadgeGrammeme({ grammeme }: BadgeGrammemeProps) {
  const { colors } = useConceptOptions();
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

export default BadgeGrammeme;
