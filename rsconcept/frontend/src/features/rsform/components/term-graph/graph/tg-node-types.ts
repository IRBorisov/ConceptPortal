import { type NodeTypes } from '@xyflow/react';

import { TGNodeComponent } from './tg-node';

export const TGNodeTypes: NodeTypes = {
  concept: TGNodeComponent
} as const;
