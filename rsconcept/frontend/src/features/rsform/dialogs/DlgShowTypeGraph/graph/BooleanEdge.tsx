import { StraightEdge } from 'reactflow';

import { MGraphEdgeProps } from './CartesianEdge';

export function BooleanEdge(props: MGraphEdgeProps) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}
