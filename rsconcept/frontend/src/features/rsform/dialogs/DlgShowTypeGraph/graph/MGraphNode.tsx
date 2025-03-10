'use client';

import { Handle, Position } from 'reactflow';

import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorBgTMGraphNode } from '../../../colors';
import { type TMGraphNode } from '../../../models/TMGraph';

/**
 * Represents graph TMGraph node internal data.
 */
interface MGraphNodeInternal {
  id: string;
  data: TMGraphNode;
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
      <Handle type='source' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={tooltipText}
        style={{
          backgroundColor: colorBgTMGraphNode(node.data),
          fontWeight: 600,
          WebkitTextStrokeWidth: '0.6px',
          WebkitTextStrokeColor: APP_COLORS.bgDefault
        }}
      >
        {node.data.rank === 0 ? node.data.text : node.data.annotations.length > 0 ? node.data.annotations.length : ''}
      </div>
      <Handle type='target' position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}
