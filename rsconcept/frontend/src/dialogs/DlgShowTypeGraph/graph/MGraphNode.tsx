'use client';

import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { TMGraphNode } from '@/models/TMGraph';
import { colorBgTMGraphNode } from '@/styling/color';
import { globals } from '@/utils/constants';

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

function MGraphNode(node: MGraphNodeInternal) {
  const { colors } = useConceptOptions();

  const tooltipText = useMemo(
    () =>
      (node.data.annotations.length === 0 ? '' : `Конституенты: ${node.data.annotations.join(' ')}<br/>`) +
      node.data.text,
    [node.data]
  );

  return (
    <>
      <Handle type='source' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        data-tooltip-id={globals.tooltip}
        data-tooltip-html={tooltipText}
        style={{ backgroundColor: colorBgTMGraphNode(node.data, colors) }}
      >
        {node.data.rank === 0 ? node.data.text : node.data.annotations.length > 0 ? node.data.annotations.length : ''}
      </div>
      <Handle type='target' position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}

export default MGraphNode;
