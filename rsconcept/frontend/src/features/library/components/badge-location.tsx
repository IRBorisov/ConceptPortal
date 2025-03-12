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
  return (
    <div className='pl-2' data-tooltip-id={globalIDs.tooltip} data-tooltip-content={location}>
      <IconLocationHead value={location} size='1.25rem' />
    </div>
  );
}
