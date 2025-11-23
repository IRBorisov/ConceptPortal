import { StraightEdge } from '@xyflow/react';

import { type MGraphEdgeProps } from './cartesian-edge';

export function BooleanEdge(props: MGraphEdgeProps) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}
