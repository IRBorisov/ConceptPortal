import { Tooltip } from '@/components/container';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../stores/operation-tooltip';

import { InfoOperation } from './info-operation';

export function OperationTooltip() {
  const hoverOperation = useOperationTooltipStore(state => state.activeOperation);
  return (
    <Tooltip
      clickable
      id={globalIDs.operation_tooltip}
      layer='z-topmost'
      className='max-w-140 dense'
      style={{ maxHeight: '30rem', overflowY: 'auto' }}
      hidden={!hoverOperation}
    >
      {hoverOperation ? <InfoOperation operation={hoverOperation} /> : null}
    </Tooltip>
  );
}
