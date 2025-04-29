'use client';

import { useEffect } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState } from 'reactflow';

import { DiagramFlow } from '@/components/flow/diagram-flow';

import { type SyntaxTree } from '../../models/rslang';

import { ASTEdgeTypes } from './graph/ast-edge-types';
import { applyLayout } from './graph/ast-layout';
import { ASTNodeTypes } from './graph/ast-node-types';

const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.25 },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 2,
  minZoom: 0.5
} as const;

interface ASTFlowProps {
  data: SyntaxTree;
  onNodeEnter: (node: Node) => void;
  onNodeLeave: (node: Node) => void;
  onChangeDragging: (value: boolean) => void;
}

export function ASTFlow({ data, onNodeEnter, onNodeLeave, onChangeDragging }: ASTFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    const newNodes = data.map(node => ({
      id: String(node.uid),
      data: node,
      position: { x: 0, y: 0 },
      type: 'token'
    }));

    const newEdges: Edge[] = [];
    data.forEach(node => {
      if (node.parent !== node.uid) {
        newEdges.push({
          id: String(node.uid),
          source: String(node.parent),
          target: String(node.uid),
          type: 'dynamic',
          focusable: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20
          }
        });
      }
    });

    applyLayout(newNodes, newEdges);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <DiagramFlow
      {...flowOptions}
      className='h-full w-full'
      nodes={nodes}
      edges={edges}
      onNodeMouseEnter={(_, node) => onNodeEnter(node)}
      onNodeMouseLeave={(_, node) => onNodeLeave(node)}
      onNodeDragStart={() => onChangeDragging(true)}
      onNodeDragStop={() => onChangeDragging(false)}
      onNodesChange={onNodesChange}
      nodeTypes={ASTNodeTypes}
      edgeTypes={ASTEdgeTypes}
    />
  );
}
