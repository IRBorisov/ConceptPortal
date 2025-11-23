import { type NodeTypes } from '@xyflow/react';

import { ASTNodeComponent } from './ast-node';

export const ASTNodeTypes: NodeTypes = {
  token: ASTNodeComponent
} as const;
