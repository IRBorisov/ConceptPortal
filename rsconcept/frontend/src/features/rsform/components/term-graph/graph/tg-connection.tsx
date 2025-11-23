import { type ConnectionLineComponentProps, getStraightPath } from '@xyflow/react';

import { colorGraphEdge } from '../../../colors';
import { useTGConnectionStore } from '../../../stores/term-graph';

export function TGConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY
  });

  const connectionType = useTGConnectionStore(state => state.connectionType);
  const color = colorGraphEdge(connectionType);

  return (
    <g>
      <path style={{ stroke: color }} className='rf-connection-line' fill='none' d={edgePath} />
    </g>
  );
}
