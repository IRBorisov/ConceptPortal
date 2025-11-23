'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { globalIDs } from '@/utils/constants';

import { colorBgTMGraphNode } from '../../../colors';
import { type TypificationNodeData } from '../../../models/typification-graph';

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
  const tooltipText =
    `<span class="font-math">${node.data.text}</span>` +
    '<br/>' +
    (node.data.annotations.length === 0 ? '' : `<b>Конституенты</b> ${node.data.annotations.join(' ')}`);
  const nodeLabel = getNodeLabel(node.data);

  return (
    <>
      <Handle type='source' position={Position.Top} className='opacity-0' />
      <div
        className='cc-node-label w-full h-full cursor-default flex items-center justify-center rounded-full'
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={tooltipText}
        style={{ backgroundColor: colorBgTMGraphNode(node.data) }}
      >
        {nodeLabel}
      </div>
      <Handle type='target' position={Position.Bottom} className='opacity-0' />
    </>
  );
}
