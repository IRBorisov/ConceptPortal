import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '../../context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant'> {
  layer?: string
}

function ConceptTooltip({
  className,
  layer='z-tooltip',
  place='bottom',
  style,
  ...restProps
}: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();

  return (
  <Tooltip
    opacity={0.97}
    style={{...{ paddingTop: '2px', paddingBottom: '2px'}, ...style}}
    className={`overflow-auto border shadow-md ${layer} ${className}`}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...restProps}
  />
  );
}

export default ConceptTooltip;
