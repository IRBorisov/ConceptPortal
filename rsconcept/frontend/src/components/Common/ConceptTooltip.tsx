import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '../../context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant'> {
  layer?: string
}

function ConceptTooltip({ className, layer, place='bottom', ...props }: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();

  return (
  <Tooltip
    opacity={0.97}
    className={`overflow-auto border shadow-md ${layer ?? 'z-tooltip'} ${className}`}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...props}
  />
  );
}

export default ConceptTooltip;
