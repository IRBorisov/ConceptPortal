import { NodeTypes } from 'reactflow';

import { InputNode } from './InputNode';
import { OperationNode } from './OperationNode';

export const OssNodeTypes: NodeTypes = {
  synthesis: OperationNode,
  input: InputNode
};
