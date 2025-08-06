import { type NodeTypes } from 'reactflow';

import { BlockNode } from './block-node';
import { InputNode } from './input-node';
import { ReplicaNode } from './replica-node';
import { SynthesisNode } from './synthesis-node';

export const OssNodeTypes: NodeTypes = {
  input: InputNode,
  synthesis: SynthesisNode,
  replica: ReplicaNode,
  block: BlockNode
} as const;
