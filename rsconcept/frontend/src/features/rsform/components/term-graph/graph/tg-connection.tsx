import { type ConnectionLineComponentProps, getStraightPath } from 'reactflow';

import { colorGraphEdge } from '@/features/rsform/colors';
import { useTGConnectionStore } from '@/features/rsform/stores/term-graph';

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
      <path style={{ stroke: color }} className='stroke-2' fill='none' d={edgePath} />
    </g>
  );
}
