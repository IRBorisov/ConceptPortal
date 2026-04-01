import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getStraightPath } from '@xyflow/react';

import { APP_COLORS } from '@/styling/colors';

const LABEL_Y_OFFSET = 10; // px

export function SPEdge({
  id, sourceX, sourceY, targetX, targetY, label,
  markerEnd, markerStart, style, interactionWidth
}: EdgeProps) {
  // Destructure only the specific props needed for edge drawing
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const labelX = targetX;
  const labelY = targetY - LABEL_Y_OFFSET;

  // Filter out props that should not go to the DOM or BaseEdge element
  // (If you have to forward all props, make sure none of the unwanted xyflow/react flow/internals props leak to DOM!)
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
        interactionWidth={interactionWidth}
        labelBgStyle={{ fill: APP_COLORS.bgDefault }}
        labelStyle={{ fill: APP_COLORS.fgDefault }}
      />
      {label ?
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              padding: '3px',
              backgroundColor: APP_COLORS.bgDefault,
              fontSize: '10px'
            }}
            className='nodrag nopan rounded-full'
          >
            {label}
          </div>
        </EdgeLabelRenderer> : null}
    </>
  );
}
