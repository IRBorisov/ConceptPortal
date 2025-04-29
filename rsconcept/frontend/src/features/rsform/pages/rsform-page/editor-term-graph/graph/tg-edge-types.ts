import { type EdgeTypes } from 'reactflow';

import { DynamicEdge } from '@/components/flow/dynamic-edge';

export const TGEdgeTypes: EdgeTypes = {
  termEdge: DynamicEdge
} as const;
