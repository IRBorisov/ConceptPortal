'use client';

import { Tooltip } from '@/components/container';
import { globalIDs } from '@/utils/constants';

import { useCstTooltipStore } from '../stores/cst-tooltip';

import { InfoConstituenta } from './info-constituenta';

export function ConstituentaTooltip() {
  const hoverCst = useCstTooltipStore(state => state.activeCst);
  return (
    <Tooltip
      clickable
      instantWhenOpen
      id={globalIDs.constituenta_tooltip}
      delayShow={500}
      delayHide={300}
      layer='z-topmost'
      className='max-w-120'
      hidden={!hoverCst}
    >
      {hoverCst ? <InfoConstituenta data={hoverCst} onClick={event => event.stopPropagation()} /> : null}
    </Tooltip>
  );
}
