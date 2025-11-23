import { type EdgeTypes } from '@xyflow/react';

import { BooleanEdge } from './boolean-edge';
import { CartesianEdge } from './cartesian-edge';

export const MGraphEdgeTypes: EdgeTypes = {
  boolean: BooleanEdge,
  cartesian: CartesianEdge
} as const;
