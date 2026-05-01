'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { type TypificationNodeData } from '@/domain/rslang';
import { useTx } from '@/i18n';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

import { colorBgTMGraphNode } from '../../../colors';

import { type MGNode } from './mgraph-models';

function getNodeLabel(data: TypificationNodeData) {
  if (data.annotations.length === 0) {
    return data.rank === 0 ? data.text : '';
  } else if (data.rank === 0) {
    return `${data.text} | ${data.annotations.length}`;
  } else {
    return data.annotations.length;
  }
}

export function MGraphNodeComponent(node: NodeProps<MGNode>) {
  const tx = useTx();
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);
  const tooltipText =
    `${node.data.text}` +
    '\n' +
    (node.data.annotations.length === 0
      ? ''
      : `${tx('ui.node.mgraph.constituentsPrefix', 'Constituents')} ${node.data.annotations.join(' ')}`);
  const nodeLabel = getNodeLabel(node.data);

  return (
    <>
      <Handle type='source' position={Position.Top} className='opacity-0' />
      <div
        className='cc-node-label w-full h-full cursor-default flex items-center justify-center rounded-full'
        data-tooltip-id={globalIDs.value_tooltip}
        onPointerEnter={() => setActiveTooltipText(tooltipText)}
        style={{ backgroundColor: colorBgTMGraphNode(node.data) }}
      >
        {nodeLabel}
      </div>
      <Handle type='target' position={Position.Bottom} className='opacity-0' />
    </>
  );
}
