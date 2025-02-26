import { Tooltip } from '@/components/Container';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../stores/operationTooltip';

import { InfoOperation } from './InfoOperation';

export function OperationTooltip() {
  const hoverOperation = useOperationTooltipStore(state => state.activeOperation);
  return (
    <Tooltip
      id={globalIDs.operation_tooltip}
      layer='z-topmost'
      className='max-w-[35rem] max-h-[40rem] dense'
      hidden={!hoverOperation}
    >
      {hoverOperation ? <InfoOperation operation={hoverOperation} /> : null}
    </Tooltip>
  );
}
