import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

import { IconLocationHead } from './icon-location-head';

interface BadgeLocationProps {
  /** Location to display. */
  location: string;
}

/**
 * Displays location icon with a full text tooltip.
 */
export function BadgeLocation({ location }: BadgeLocationProps) {
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);

  return (
    <div
      className='pl-2'
      data-tooltip-id={globalIDs.value_tooltip}
      onPointerEnter={() => setActiveTooltipText(location)}
    >
      <IconLocationHead value={location} size='1.25rem' />
    </div>
  );
}
