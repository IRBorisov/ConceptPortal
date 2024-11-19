import { EdgeTypes } from 'reactflow';

import BooleanEdge from './BooleanEdge';
import CartesianEdge from './CartesianEdge';

export const TMGraphEdgeTypes: EdgeTypes = {
  boolean: BooleanEdge,
  cartesian: CartesianEdge
};
