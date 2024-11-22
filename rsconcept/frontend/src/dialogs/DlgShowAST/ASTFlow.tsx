'use client';

import { useLayoutEffect } from 'react';
import { Edge, MarkerType, Node, ReactFlow, useEdgesState, useNodesState } from 'reactflow';

import { SyntaxTree } from '@/models/rslang';

import { ASTEdgeTypes } from './graph/ASTEdgeTypes';
import { applyLayout } from './graph/ASTLayout';
import { ASTNodeTypes } from './graph/ASTNodeTypes';

interface ASTFlowProps {
  data: SyntaxTree;
  onNodeEnter: (node: Node) => void;
  onNodeLeave: (node: Node) => void;
}

function ASTFlow({ data, onNodeEnter, onNodeLeave }: ASTFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useLayoutEffect(() => {
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
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgesFocusable={false}
      nodesFocusable={false}
      onNodeMouseEnter={(_, node) => onNodeEnter(node)}
      onNodeMouseLeave={(_, node) => onNodeLeave(node)}
      onNodesChange={onNodesChange}
      nodeTypes={ASTNodeTypes}
      edgeTypes={ASTEdgeTypes}
      fitView
      maxZoom={2}
      minZoom={0.5}
      nodesConnectable={false}
    />
  );
}

export default ASTFlow;
