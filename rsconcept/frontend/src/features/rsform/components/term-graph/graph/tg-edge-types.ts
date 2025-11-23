import { type EdgeTypes } from '@xyflow/react';

import { TGEdgeComponent } from './tg-edge';

export const TGEdgeTypes: EdgeTypes = {
  termEdge: TGEdgeComponent
} as const;
