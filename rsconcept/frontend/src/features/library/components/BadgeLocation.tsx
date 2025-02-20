import { LocationIcon } from '@/components/DomainIcons';
import { globalIDs } from '@/utils/constants';

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
      <LocationIcon value={location} size='1.25rem' />
    </div>
  );
}
