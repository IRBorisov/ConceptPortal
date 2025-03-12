import { type EdgeTypes } from 'reactflow';

import { BooleanEdge } from './boolean-edge';
import { CartesianEdge } from './cartesian-edge';

export const TMGraphEdgeTypes: EdgeTypes = {
  boolean: BooleanEdge,
  cartesian: CartesianEdge
};
