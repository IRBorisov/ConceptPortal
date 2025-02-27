import { Tooltip } from '@/components/Container';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../stores/operationTooltip';

import { InfoOperation } from './InfoOperation';

export function OperationTooltip() {
  const hoverOperation = useOperationTooltipStore(state => state.activeOperation);
  return (
    <Tooltip
      clickable
      id={globalIDs.operation_tooltip}
      layer='z-topmost'
      className='max-w-[35rem] dense'
      style={{ maxHeight: '30rem', overflowY: 'auto' }}
      hidden={!hoverOperation}
    >
      {hoverOperation ? <InfoOperation operation={hoverOperation} /> : null}
    </Tooltip>
  );
}
