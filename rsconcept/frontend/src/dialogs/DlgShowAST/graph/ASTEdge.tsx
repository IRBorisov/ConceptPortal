import { EdgeProps, getStraightPath } from 'reactflow';

const NODE_RADIUS = 20;
const EDGE_RADIUS = 25;

function ASTEdge({ id, markerEnd, style, ...props }: EdgeProps) {
  const scale =
    EDGE_RADIUS /
    Math.sqrt(
      Math.pow(props.sourceX - props.targetX, 2) +
        Math.pow(Math.abs(props.sourceY - props.targetY) + 2 * NODE_RADIUS, 2)
    );

  const [path] = getStraightPath({
    sourceX: props.sourceX - (props.sourceX - props.targetX) * scale,
    sourceY: props.sourceY - (props.sourceY - props.targetY - 2 * NODE_RADIUS) * scale - NODE_RADIUS,
    targetX: props.targetX + (props.sourceX - props.targetX) * scale,
    targetY: props.targetY + (props.sourceY - props.targetY - 2 * NODE_RADIUS) * scale + NODE_RADIUS
  });

  return (
    <>
      <path id={id} className='react-flow__edge-path' d={path} markerEnd={markerEnd} style={style} />
    </>
  );
}

export default ASTEdge;
