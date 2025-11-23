import { type EdgeTypes } from '@xyflow/react';

import { DynamicEdge } from '@/components/flow/dynamic-edge';

export const ASTEdgeTypes: EdgeTypes = {
  dynamic: DynamicEdge
} as const;
