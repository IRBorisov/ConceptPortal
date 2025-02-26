import { Tooltip } from '@/components/Container';
import { globalIDs } from '@/utils/constants';

import { useCstTooltipStore } from '../stores/cstTooltip';

import { InfoConstituenta } from './InfoConstituenta';

export function ConstituentaTooltip() {
  const hoverCst = useCstTooltipStore(state => state.activeCst);
  return (
    <Tooltip
      clickable
      id={globalIDs.constituenta_tooltip}
      layer='z-topmost'
      className='max-w-[30rem]'
      hidden={!hoverCst}
    >
      {hoverCst ? <InfoConstituenta data={hoverCst} onClick={event => event.stopPropagation()} /> : null}
    </Tooltip>
  );
}
