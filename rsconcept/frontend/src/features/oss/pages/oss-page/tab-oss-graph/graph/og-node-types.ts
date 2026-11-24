import { type NodeTypes } from '@xyflow/react';

import { BlockNodeComponent } from './block-node';
import { InputNodeComponent } from './input-node';
import { RelativizationNode } from './relativization-node';
import { ReplicaNode } from './replica-node';
import { SynthesisNode } from './synthesis-node';

export const OssGraphNodeTypes: NodeTypes = {
  input: InputNodeComponent,
  synthesis: SynthesisNode,
  relativization: RelativizationNode,
  replica: ReplicaNode,
  block: BlockNodeComponent
} as const;
