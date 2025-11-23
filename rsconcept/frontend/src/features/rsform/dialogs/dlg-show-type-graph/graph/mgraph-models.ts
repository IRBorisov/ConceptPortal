import { type Edge, type Node } from '@xyflow/react';

import { type TypificationNodeData } from '../../../models/typification-graph';

/** Represents a single node of a {@link TypificationGraph}. */
export type MGNode = Node<TypificationNodeData>;

/** Represents a single edge of a {@link TypificationGraph}. */
export type MGEdge = Edge<{ indices: number[] }>;
