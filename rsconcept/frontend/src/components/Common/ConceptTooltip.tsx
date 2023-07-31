import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '../../context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant'> {
  
}

function ConceptTooltip({ className, place='bottom', ...props }: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();

  return (
  <Tooltip
    className={`overflow-auto border shadow-md z-20 ${className}`}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...props}
  />
  );
}

export default ConceptTooltip;
