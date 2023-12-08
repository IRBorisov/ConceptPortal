import { useConceptTheme } from '../../context/ThemeContext';
import { GramData } from '../../models/language';
import { colorfgGrammeme } from '../../utils/color';
import { labelGrammeme } from '../../utils/labels';

interface GrammemeBadgeProps {
  key?: string
  grammeme: GramData
}

function GrammemeBadge({ key, grammeme }: GrammemeBadgeProps) {
  const { colors } = useConceptTheme();
  return (
  <div
    key={key}
    className='min-w-[3rem] px-1 text-sm text-center rounded-md whitespace-nowrap'
    style={{
      borderWidth: '1px', 
      borderColor: colorfgGrammeme(grammeme, colors),
      color: colorfgGrammeme(grammeme, colors), 
      fontWeight: 600,
      backgroundColor: colors.bgInput
    }}
  >
    {labelGrammeme(grammeme)}
  </div>);
}

export default GrammemeBadge;