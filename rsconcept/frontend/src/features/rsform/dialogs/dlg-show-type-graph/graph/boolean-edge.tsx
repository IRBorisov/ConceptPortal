import { StraightEdge } from 'reactflow';

import { type MGraphEdgeProps } from './cartesian-edge';

export function BooleanEdge(props: MGraphEdgeProps) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}
