import { type EdgeProps, getStraightPath } from 'reactflow';

import { PARAMETER } from '@/utils/constants';

const RADIUS = PARAMETER.graphNodeRadius + PARAMETER.graphNodePadding;

export function TermGraphEdge({ id, markerEnd, style, ...props }: EdgeProps) {
  const sourceY = props.sourceY - PARAMETER.graphNodeRadius;
  const targetY = props.targetY + PARAMETER.graphNodeRadius;

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
      <path d={path} className='rf-edge-events cursor-pointer!' />
    </>
  );
}
