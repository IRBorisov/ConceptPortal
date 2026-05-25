import { type Node } from '@xyflow/react';

import { type FlatAstNode } from '@/domain/parsing';

/** Represents a single node of a Syntax tree. */
export type AstGraphNode = Node<FlatAstNode>;
