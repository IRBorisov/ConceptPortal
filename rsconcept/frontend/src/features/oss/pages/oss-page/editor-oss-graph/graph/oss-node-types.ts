import { type NodeTypes } from 'reactflow';

import { BlockNode } from './block-node';
import { InputNode } from './input-node';
import { ReferenceNode } from './reference-node';
import { SynthesisNode } from './synthesis-node';

export const OssNodeTypes: NodeTypes = {
  input: InputNode,
  synthesis: SynthesisNode,
  reference: ReferenceNode,
  block: BlockNode
} as const;
