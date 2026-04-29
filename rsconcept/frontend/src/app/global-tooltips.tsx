'use client';

import { Tooltip } from '@/components/container';
import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

export const GlobalTooltips = () => {
  const activeText = useValueTooltipStore(state => state.activeText);
  return (
    <>
      <Tooltip
        float
        id={globalIDs.tooltip}
        layer='z-topmost'
        place='bottom-start'
        offset={16}
        className='max-w-80 wrap-break-word rounded-lg! select-none'
      />
      <Tooltip
        float
        id={globalIDs.value_tooltip}
        layer='z-topmost'
        className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
      >
        {activeText}
      </Tooltip>
    </>
  );
};
