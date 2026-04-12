import { type Edge, type Node } from '@xyflow/react';

import { type SPNode } from '@/domain/library/structure-planner';

export interface SPFlowNodeData extends Record<string, unknown> {
  node: SPNode;
}

export type SPFlowNode = Node<SPFlowNodeData>;
export type SPFlowEdge = Edge<{ projection?: number }>;
