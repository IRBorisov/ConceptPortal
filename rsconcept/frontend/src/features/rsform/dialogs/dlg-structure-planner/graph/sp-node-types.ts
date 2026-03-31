import { type NodeTypes } from '@xyflow/react';

import { SPNodeComponent } from './sp-node';

export const SPNodeTypes: NodeTypes = {
  step: SPNodeComponent
} as const;
