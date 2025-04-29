import { type EdgeTypes } from 'reactflow';

import { DynamicEdge } from '@/components/flow/dynamic-edge';

export const ASTEdgeTypes: EdgeTypes = {
  dynamic: DynamicEdge
} as const;
