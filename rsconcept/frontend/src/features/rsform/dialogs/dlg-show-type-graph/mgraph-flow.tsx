'use client';

import { useEffect } from 'react';
import { useEdgesState, useNodesState } from '@xyflow/react';

import { DiagramFlow } from '@/components/flow/diagram-flow';

import { type TypificationGraph } from '../../models/typification-graph';

import { MGraphEdgeTypes } from './graph/mgraph-edge-types';
import { applyLayout } from './graph/mgraph-layout';
import { type MGEdge, type MGNode } from './graph/mgraph-models';
import { MGraphNodeTypes } from './graph/mgraph-node-types';

const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.25 },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 2,
  minZoom: 0.5
} as const;

interface MGraphFlowProps {
  data: TypificationGraph;
}

export function MGraphFlow({ data }: MGraphFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<MGNode>([]);
  const [edges, setEdges] = useEdgesState<MGEdge>([]);

  useEffect(() => {
    const newNodes = data.nodes.map(node => ({
      id: String(node.id),
      data: node,
      position: { x: 0, y: 0 },
      type: 'step'
    }));

    const newEdges: MGEdge[] = [];
    data.nodes.forEach(node => {
      const visited = new Set<number>();
      const edges = new Map<number, number>();
      node.parents.forEach((parent, index) => {
        if (visited.has(parent)) {
          newEdges.at(edges.get(parent)!)!.data!.indices.push(index + 1);
        } else {
          newEdges.push({
            id: String(newEdges.length),
            data: node.parents.length > 1 ? { indices: [index + 1] } : undefined,
            source: String(parent),
            target: String(node.id),
            type: node.parents.length > 1 ? 'cartesian' : 'boolean'
          });
          edges.set(parent, newEdges.length - 1);
          visited.add(parent);
        }
      });
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
      onNodesChange={onNodesChange}
      nodeTypes={MGraphNodeTypes}
      edgeTypes={MGraphEdgeTypes}
    />
  );
}
