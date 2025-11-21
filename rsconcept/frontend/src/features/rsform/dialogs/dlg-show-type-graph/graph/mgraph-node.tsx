'use client';

import { Handle, Position } from 'reactflow';

import { globalIDs } from '@/utils/constants';

import { colorBgTMGraphNode } from '../../../colors';
import { type TypificationGraphNode } from '../../../models/typification-graph';

/**
 * Represents graph TMGraph node internal data.
 */
interface MGraphNodeInternal {
  id: string;
  data: TypificationGraphNode;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

function getNodeLabel(node: MGraphNodeInternal) {
  if (node.data.annotations.length === 0) {
    return node.data.rank === 0 ? node.data.text : '';
  } else if (node.data.rank === 0) {
    return `${node.data.text} | ${node.data.annotations.length}`;
  } else {
    return node.data.annotations.length;
  }
}

export function MGraphNode(node: MGraphNodeInternal) {
  const tooltipText =
    `<span class="font-math">${node.data.text}</span>` +
    '<br/>' +
    (node.data.annotations.length === 0 ? '' : `<b>Конституенты</b> ${node.data.annotations.join(' ')}`);
  const nodeLabel = getNodeLabel(node);

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
