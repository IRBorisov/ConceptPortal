'use client';

import { Tooltip } from '@/components/container';
import { globalIDs } from '@/utils/constants';

export const GlobalTooltips = () => {
  return (
    <>
      <Tooltip
        float
        id={globalIDs.tooltip}
        layer='z-topmost'
        place='right-start'
        className='mt-8 max-w-80 break-words rounded-lg!'
      />
      <Tooltip
        float
        id={globalIDs.value_tooltip}
        layer='z-topmost'
        className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
      />
    </>
  );
};
