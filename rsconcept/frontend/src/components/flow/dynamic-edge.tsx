import { type EdgeProps, getStraightPath } from '@xyflow/react';

import { PARAMETER } from '@/utils/constants';

const RADIUS = PARAMETER.graphNodeRadius + PARAMETER.graphNodePadding;

export function DynamicEdge({ id, markerEnd, style, ...props }: EdgeProps) {
  const sourceY = props.sourceY - PARAMETER.graphNodeRadius - PARAMETER.graphHandleSize;
  const targetY = props.targetY + PARAMETER.graphNodeRadius + PARAMETER.graphHandleSize;

  const dx = props.targetX - props.sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  if (distance <= 2 * RADIUS) {
    return null;
  }

  const ux = dx / distance;
  const uy = dy / distance;

  const [path] = getStraightPath({
    sourceX: props.sourceX + ux * RADIUS,
    sourceY: sourceY + uy * RADIUS,
    targetX: props.targetX - ux * RADIUS,
    targetY: targetY - uy * RADIUS
  });

  return (
    <>
      <path id={id} className='react-flow__edge-path' d={path} markerEnd={markerEnd} style={style} />
    </>
  );
}
