import { globals } from '@/utils/constants';

import { LocationIcon } from '../DomainIcons';

interface BadgeLocationProps {
  location: string;
}

function BadgeLocation({ location }: BadgeLocationProps) {
  return (
    <div className='pl-2' data-tooltip-id={globals.tooltip} data-tooltip-content={location}>
      <LocationIcon value={location} size='1.25rem' />
    </div>
  );
}

export default BadgeLocation;
