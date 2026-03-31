import { type EdgeTypes } from '@xyflow/react';

import { SPEdge } from './sp-edge';

export const SPEdgeTypes: EdgeTypes = {
  planner: SPEdge
} as const;
