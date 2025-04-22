import { Tooltip } from '@/components/container';
import { globalIDs } from '@/utils/constants';

import { type IBlock, type IOperation } from '../models/oss';
import { isOperation } from '../models/oss-api';
import { useOperationTooltipStore } from '../stores/operation-tooltip';

import { InfoBlock } from './info-block';
import { InfoOperation } from './info-operation';

export function OperationTooltip() {
  const hoverItem = useOperationTooltipStore(state => state.hoverItem);
  const isOperationNode = isOperation(hoverItem);

  return (
    <Tooltip
      clickable
      id={globalIDs.operation_tooltip}
      layer='z-topmost'
      className='max-w-140 dense max-h-120! overflow-y-auto!'
      hidden={!hoverItem}
    >
      {hoverItem && isOperationNode ? <InfoOperation operation={hoverItem as IOperation} /> : null}
      {hoverItem && !isOperationNode ? <InfoBlock block={hoverItem as IBlock} /> : null}
    </Tooltip>
  );
}
