'use client';

import { useEffect, useRef } from 'react';
import { type Node, useEdgesState, useNodesState, useOnSelectionChange, useReactFlow } from '@xyflow/react';

import { type ExpressionType, TypeID } from '@/features/rslang/semantic/typification';

import { DiagramFlow } from '@/components/flow/diagram-flow';

import { type SPNode } from '../../models/structure-planner';

import { SPEdgeTypes } from './graph/sp-edge-types';
import { applyLayout } from './graph/sp-layout';
import { type SPFlowEdge, type SPFlowNode } from './graph/sp-models';
import { SPNodeTypes } from './graph/sp-node-types';

const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.25 },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 2,
  minZoom: 0.5,
  nodesDraggable: false
} as const;

interface StructureFlowProps {
  items: SPNode[];
  rootType: ExpressionType;
  selected: string;
  setSelected: (key: string) => void;
}

export function StructureFlow({ items, rootType, selected, setSelected }: StructureFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<SPFlowNode>([]);
  const [edges, setEdges] = useEdgesState<SPFlowEdge>([]);
  const { viewportInitialized } = useReactFlow();

  const isLoadingSelection = useRef(false);
  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    if (isLoadingSelection.current) {
      return;
    }
    const selectedNodes = nodes.map(node => node.id);
    if (selectedNodes.length === 0) {
      return;
    }
    setSelected(selectedNodes[0]);
  }
  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(
    function updateGraph() {
      if (!viewportInitialized) {
        return;
      }

      const newNodes: SPFlowNode[] = items.map(node => ({
        id: node.key,
        data: { node: node },
        position: { x: 0, y: 0 },
        type: 'step',
        draggable: false
      }));

      const newEdges: SPFlowEdge[] = items
        .filter(node => node.parent !== null)
        .map(node => {
          const parentNode = items[node.parent!];
          return {
            id: `${parentNode.key}-${node.key}`,
            source: parentNode.key,
            target: node.key,
            type: 'planner',
            label: generateEdgeLabel(node.path.at(-1), parentNode.type.typeID === TypeID.collection)
          };
        });

      applyLayout(newNodes, newEdges);

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [items, rootType, setEdges, setNodes, viewportInitialized]
  );

  const readyForUpdate = nodes.length === items.length;
  const prevSelectedNodes = useRef<string>('');
  useEffect(
    function updateSelectedNodes() {
      if (!viewportInitialized || !readyForUpdate) {
        return;
      }
      if (prevSelectedNodes.current === selected) {
        return;
      }

      isLoadingSelection.current = true;
      prevSelectedNodes.current = selected;
      setNodes(prev =>
        prev.map(node => ({
          ...node,
          selected: selected === node.id
        }))
      );

      const frame = requestAnimationFrame(() => {
        isLoadingSelection.current = false;
      });
      return () => cancelAnimationFrame(frame);
    },
    [viewportInitialized, selected, setNodes, readyForUpdate]
  );

  return (
    <DiagramFlow
      {...flowOptions}
      className='h-full w-full'
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      nodeTypes={SPNodeTypes}
      edgeTypes={SPEdgeTypes}
      onNodeClick={(_event, node) => setSelected(node.id)}
    />
  );
}

// ====== Internals ======
function generateEdgeLabel(projection: number | undefined, isCollection: boolean): string {
  if (!projection) {
    return 'red';
  } else if (isCollection) {
    return `Pr${projection}`;
  } else {
    return `pr${projection}`;
  }
}
