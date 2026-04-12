'use client';

import { Tooltip } from '@/components/container';
import { NodeType } from '@/domain/library';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../stores/operation-tooltip';

import { InfoBlock } from './info-block';
import { InfoOperation } from './info-operation';

export function OperationTooltip() {
  const hoverItem = useOperationTooltipStore(state => state.hoverItem);
  const isOperationNode = hoverItem?.nodeType === NodeType.OPERATION;

  return (
    <Tooltip
      clickable
      id={globalIDs.operation_tooltip}
      layer='z-topmost'
      className='max-w-100 lg:max-w-140 dense max-h-80 lg:max-h-120! overflow-y-auto!'
      hidden={!hoverItem}
    >
      {hoverItem && isOperationNode ? <InfoOperation operation={hoverItem} /> : null}
      {hoverItem && !isOperationNode ? <InfoBlock block={hoverItem} /> : null}
    </Tooltip>
  );
}
