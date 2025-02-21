import { StraightEdge } from 'reactflow';

import { type MGraphEdgeProps } from './CartesianEdge';

export function BooleanEdge(props: MGraphEdgeProps) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}
