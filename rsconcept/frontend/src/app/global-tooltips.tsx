'use client';

import { Tooltip } from '@/components/container';
import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

import { TouchTooltipGuard } from './touch-tooltip-guard';

export const GlobalTooltips = () => {
  const isOpen = useValueTooltipStore(state => state.isOpen);
  const activeText = useValueTooltipStore(state => state.activeText);
  const anchorPosition = useValueTooltipStore(state => state.anchorPosition);
  const hide = useValueTooltipStore(state => state.hide);
  const clearDisplayed = useValueTooltipStore(state => state.clearDisplayed);

  return (
    <>
      <TouchTooltipGuard />
      <Tooltip
        float
        instantWhenOpen
        delayShow={300}
        delayHide={200}
        id={globalIDs.tooltip}
        layer='z-topmost'
        place='bottom-start'
        offset={16}
        className='max-w-80 wrap-break-word select-none'
      />
      <Tooltip
        float
        instantWhenOpen
        delayShow={0}
        delayHide={200}
        isOpen={isOpen}
        setIsOpen={open => {
          if (!open) {
            hide();
          }
        }}
        afterHide={clearDisplayed}
        position={anchorPosition ?? undefined}
        id={globalIDs.value_tooltip}
        layer='z-topmost'
        className='max-w-[calc(min(36rem,100dvw-2rem))] wrap-break-word'
      >
        {activeText}
      </Tooltip>
    </>
  );
};
