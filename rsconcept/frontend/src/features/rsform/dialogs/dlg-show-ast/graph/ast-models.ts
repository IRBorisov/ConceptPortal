import { type Node } from '@xyflow/react';

import { type FlatAstNode } from '@/utils/parsing';

/** Represents a single node of a Syntax tree. */
export type ASTNode = Node<FlatAstNode>;
