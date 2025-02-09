import { StraightEdge } from 'reactflow';

import { MGraphEdgeProps } from './CartesianEdge';

function BooleanEdge(props: MGraphEdgeProps) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}

export default BooleanEdge;
