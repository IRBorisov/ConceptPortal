'use client';

import { useLayoutEffect } from 'react';
import { Edge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from 'reactflow';

import { TMGraph } from '@/models/TMGraph';
import { PARAMETER } from '@/utils/constants';

import { TMGraphEdgeTypes } from './graph/MGraphEdgeTypes';
import { applyLayout } from './graph/MGraphLayout';
import { TMGraphNodeTypes } from './graph/MGraphNodeTypes';

interface MGraphFlowProps {
  data: TMGraph;
}

function MGraphFlow({ data }: MGraphFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const flow = useReactFlow();

  useLayoutEffect(() => {
    const newNodes = data.nodes.map(node => ({
      id: String(node.id),
      data: node,
      position: { x: 0, y: 0 },
      type: 'step'
    }));

    const newEdges: Edge[] = [];
    data.nodes.forEach(node => {
      const visited = new Set<number>();
      const edges = new Map<number, number>();
      node.parents.forEach((parent, index) => {
        if (visited.has(parent)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
    flow.fitView({ duration: PARAMETER.zoomDuration });
  }, [data, setNodes, setEdges, flow]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgesFocusable={false}
      nodesFocusable={false}
      onNodesChange={onNodesChange}
      nodeTypes={TMGraphNodeTypes}
      edgeTypes={TMGraphEdgeTypes}
      fitView
      maxZoom={2}
      minZoom={0.5}
      nodesConnectable={false}
      snapToGrid={true}
      snapGrid={[PARAMETER.ossGridSize, PARAMETER.ossGridSize]}
    />
  );
}

export default MGraphFlow;
