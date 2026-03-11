import { type ConnectionLineComponentProps, getStraightPath } from '@xyflow/react';

export function OgConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY
  });
  return (
    <g>
      <path className='rf-connection-line stroke-border' fill='none' d={edgePath} />
    </g>
  );
}