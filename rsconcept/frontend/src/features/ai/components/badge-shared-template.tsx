'use client';

import { useTx } from '@/app/i18n/use-tx';

import { globalIDs } from '@/utils/constants';

import { IconSharedTemplate } from './icon-shared-template';

interface BadgeSharedTemplateProps {
  value: boolean;
}

/**
 * Displays location icon with a full text tooltip.
 */
export function BadgeSharedTemplate({ value }: BadgeSharedTemplateProps) {
  const tx = useTx();
  return (
    <div
      className='pl-2'
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content={
        value ? tx('ui.ai.badge.templateShared', 'Shared') : tx('ui.ai.badge.templatePersonal', 'Personal')
      }
    >
      <IconSharedTemplate value={value} size='1.25rem' />
    </div>
  );
}
