import { EdgeProps, getStraightPath } from 'reactflow';

import { PARAMETER } from '@/utils/constants';

function TGEdge({ id, markerEnd, style, ...props }: EdgeProps) {
  const sourceY = props.sourceY - PARAMETER.graphNodeRadius;
  const targetY = props.targetY + PARAMETER.graphNodeRadius;

  const scale =
    (PARAMETER.graphNodePadding + PARAMETER.graphNodeRadius) /
    Math.sqrt(Math.pow(props.sourceX - props.targetX, 2) + Math.pow(Math.abs(sourceY - targetY), 2));

  const [path] = getStraightPath({
    sourceX: props.sourceX - (props.sourceX - props.targetX) * scale,
    sourceY: sourceY - (sourceY - targetY) * scale,
    targetX: props.targetX + (props.sourceX - props.targetX) * scale,
    targetY: targetY + (sourceY - targetY) * scale
  });

  return (
    <>
      <path id={id} className='react-flow__edge-path' d={path} markerEnd={markerEnd} style={style} />
    </>
  );
}

export default TGEdge;
