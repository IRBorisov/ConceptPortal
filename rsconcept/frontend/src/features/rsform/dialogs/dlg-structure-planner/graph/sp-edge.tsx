import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getStraightPath } from '@xyflow/react';

import { APP_COLORS } from '@/styling/colors';

const LABEL_Y_OFFSET = 15; // px

export interface SPEdgeProps extends EdgeProps {
  data?: { projection?: number; };
}

export function SPEdge({ id, sourceX, sourceY, targetX, targetY, ...props }: SPEdgeProps) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const dx = sourceX - targetX;
  const dy = sourceY - targetY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const labelX = targetX + (dx / length) * LABEL_Y_OFFSET;
  const labelY = targetY + (dy / length) * LABEL_Y_OFFSET;

  return (<>
    <BaseEdge
      id={id}
      path={edgePath}
      labelBgStyle={{ fill: APP_COLORS.bgDefault }}
      labelStyle={{ fill: APP_COLORS.fgDefault }}
      {...props}
    />
    {props.data?.projection ?
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            padding: '2px',
            backgroundColor: APP_COLORS.bgDefault,
            fontSize: '12px'
          }}
          className='nodrag nopan rounded-full'
        >
          {props.data?.projection}
        </div>
      </EdgeLabelRenderer> : null}
  </>
  );
}
