import { type Node } from '@xyflow/react';

import { type Block, type Operation } from '@rsconcept/domain/library';

export type OperationNodeType = 'input' | 'synthesis' | 'replica';

/** Represents graph OSS {@link Operation} node data. */
interface OperationNodeData extends Record<string, unknown> {
  label: string;
  operation: Operation;
}

/** Represents graph OSS {@link Block} node data. */
interface BlockNodeData extends Record<string, unknown> {
  label: string;
  block: Block;
}

/** Represents graph OSS node. */
export type OGNode = OGOperationNode | OGBlockNode;
export type OGOperationNode = Omit<Node<OperationNodeData>, 'type'> & {
  type: 'input' | 'synthesis' | 'replica';
};
export type OGBlockNode = Omit<Node<BlockNodeData>, 'type'> & {
  type: 'block';
};
