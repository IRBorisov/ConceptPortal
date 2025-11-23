import { type NodeTypes } from '@xyflow/react';

import { MGraphNodeComponent } from './mgraph-node';

export const MGraphNodeTypes: NodeTypes = {
  step: MGraphNodeComponent
} as const;
