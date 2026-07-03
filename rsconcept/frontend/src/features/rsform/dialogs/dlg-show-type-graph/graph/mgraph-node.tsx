'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { useTx } from '@/i18n';
import { type TypificationNodeData } from '@rsconcept/domain/rslang';

import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';

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
  const tooltipText =
    `${node.data.text}` +
    '\n' +
    (node.data.annotations.length === 0 ? '' : `${tx('tx.cst.plural')} ${node.data.annotations.join(' ')}`);
  const tooltipAnchor = useValueTooltipAnchor(tooltipText);
  const nodeLabel = getNodeLabel(node.data);

  return (
    <>
      <Handle type='source' position={Position.Top} className='opacity-0' />
      <div
        className='cc-node-label w-full h-full cursor-default flex items-center justify-center rounded-full'
        {...tooltipAnchor}
        style={{ backgroundColor: colorBgTMGraphNode(node.data) }}
      >
        {nodeLabel}
      </div>
      <Handle type='target' position={Position.Bottom} className='opacity-0' />
    </>
  );
}
