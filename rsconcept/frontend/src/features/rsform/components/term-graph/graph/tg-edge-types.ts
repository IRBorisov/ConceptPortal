import { type EdgeTypes } from 'reactflow';

import { TermGraphEdge } from './tg-edge';

export const TGEdgeTypes: EdgeTypes = {
  termEdge: TermGraphEdge
} as const;
