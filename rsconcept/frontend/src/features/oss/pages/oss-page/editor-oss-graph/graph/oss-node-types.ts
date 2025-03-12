import { type NodeTypes } from 'reactflow';

import { InputNode } from './input-node';
import { OperationNode } from './operation-node';

export const OssNodeTypes: NodeTypes = {
  synthesis: OperationNode,
  input: InputNode
};
