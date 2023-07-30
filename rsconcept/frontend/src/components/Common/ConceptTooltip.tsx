import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '../../context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant' | 'place'> {
  
}

function ConceptTooltip({ className, ...props }: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();

  return (
  <Tooltip
    className={`overflow-auto border shadow-md z-20 ${className}`}
    variant={(darkMode ? 'dark' : 'light')}
    place='bottom'
    {...props}
  />
  );
}

export default ConceptTooltip;
