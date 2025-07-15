import { globalIDs } from '@/utils/constants';

import { IconSharedTemplate } from './icon-shared-template';

interface BadgeSharedTemplateProps {
  value: boolean;
}

/**
 * Displays location icon with a full text tooltip.
 */
export function BadgeSharedTemplate({ value }: BadgeSharedTemplateProps) {
  return (
    <div className='pl-2' data-tooltip-id={globalIDs.tooltip} data-tooltip-content={value ? 'Общий' : 'Личный'}>
      <IconSharedTemplate value={value} size='1.25rem' />
    </div>
  );
}
