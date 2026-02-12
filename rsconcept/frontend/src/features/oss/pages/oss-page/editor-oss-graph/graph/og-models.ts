import { type Node } from '@xyflow/react';

import { type Block, type Operation } from '../../../../models/oss';

export type OperationNodeType = 'input' | 'synthesis' | 'replica';

/** Represents graph OSS {@link Operation} node data. */
export interface OperationNodeData extends Record<string, unknown> {
  label: string;
  operation: Operation;
}

/** Represents graph OSS {@link Block} node data. */
export interface BlockNodeData extends Record<string, unknown> {
  label: string;
  block: Block;
}

/** Represents graph OSS node data. */
export type OGNodeData = OperationNodeData | BlockNodeData;

/** Represents graph OSS node. */
export type OGNode = OGOperationNode | OGBlockNode;
export type OGOperationNode = Omit<Node<OperationNodeData>, 'type'> & {
  type: 'input' | 'synthesis' | 'replica';
};
export type OGBlockNode = Omit<Node<BlockNodeData>, 'type'> & {
  type: 'block';
};
