'use client';

import { useEffect, useRef } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState, useOnSelectionChange } from '@xyflow/react';

import { DiagramFlow } from '@/components/flow/diagram-flow';
import { type RO } from '@/utils/meta';
import { type FlatAST } from '@/utils/parsing';

import { ASTEdgeTypes } from './graph/ast-edge-types';
import { applyLayout } from './graph/ast-layout';
import { type ASTNode } from './graph/ast-models';
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
  data: RO<FlatAST>;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onNodeEnter: (node: ASTNode) => void;
  onNodeLeave: (node: ASTNode) => void;
  onChangeDragging: (value: boolean) => void;
}

export function ASTFlow({
  data,
  selectedIds,
  onSelectedIdsChange,
  onNodeEnter,
  onNodeLeave,
  onChangeDragging
}: ASTFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ASTNode>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const isLoadingSelection = useRef(false);

  function handleSelectionChange({ nodes: selectedNodes }: { nodes: Node[] }) {
    if (isLoadingSelection.current) {
      return;
    }
    onSelectedIdsChange(selectedNodes.map(node => Number(node.id)));
  }

  useOnSelectionChange({
    onChange: handleSelectionChange
  });

  useEffect(
    function updateGraph() {
      const newNodes = data.map(node => ({
        id: String(node.uid),
        data: node,
        position: { x: 0, y: 0 },
        type: 'token'
      }));

      const newEdges: Edge[] = [];
      for (const node of data) {
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
      }

      applyLayout(newNodes, newEdges);

      setNodes(prev =>
        newNodes.map(node => ({
          ...node,
          selected: prev.find(item => item.id === node.id)?.selected ?? false
        }))
      );
      setEdges(newEdges);
    },
    [data, setNodes, setEdges]
  );

  const prevSelectedIdsRef = useRef<number[]>([]);
  useEffect(
    function syncSelectionToNodes() {
      const prev = prevSelectedIdsRef.current;
      const same = prev.length === selectedIds.length && prev.every((id, index) => id === selectedIds[index]);
      if (same) {
        return;
      }
      prevSelectedIdsRef.current = selectedIds;

      isLoadingSelection.current = true;
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          selected: selectedIds.includes(Number(node.id))
        }))
      );

      const frame = requestAnimationFrame(function clearLoadingSelection() {
        isLoadingSelection.current = false;
      });
      return () => cancelAnimationFrame(frame);
    },
    [selectedIds, setNodes]
  );

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
