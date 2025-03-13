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

export function MGraphNode(node: MGraphNodeInternal) {
  const tooltipText =
    (node.data.annotations.length === 0 ? '' : `Конституенты: ${node.data.annotations.join(' ')}<br/>`) +
    node.data.text;

  return (
    <>
      <Handle type='source' position={Position.Top} className='opacity-0' />
      <div
        className='cc-node-label w-full h-full cursor-default flex items-center justify-center rounded-full'
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={tooltipText}
        style={{ backgroundColor: colorBgTMGraphNode(node.data) }}
      >
        {node.data.rank === 0 ? node.data.text : node.data.annotations.length > 0 ? node.data.annotations.length : ''}
      </div>
      <Handle type='target' position={Position.Bottom} className='opacity-0' />
    </>
  );
}
