import { type NodeTypes } from 'reactflow';

import { BlockNode } from './block-node';
import { InputNode } from './input-node';
import { OperationNode } from './operation-node';

export const OssNodeTypes: NodeTypes = {
  synthesis: OperationNode,
  input: InputNode,
  block: BlockNode
} as const;
