'use client';

import { useCallback, useEffect, useState } from 'react';
import { type Edge, type Node, useEdgesState, useNodesState, useOnSelectionChange, useReactFlow } from 'reactflow';

import { type IOperationSchema } from '@/features/oss/models/oss';
import { type Position2D } from '@/features/oss/models/oss-layout';
import { useOSSGraphStore } from '@/features/oss/stores/oss-graph';

import { PARAMETER } from '@/utils/constants';

import { useOssEdit } from '../oss-edit-context';

import { flowOptions } from './oss-flow';
import { OssFlowContext } from './oss-flow-context';

const Z_BLOCK = 1;
const Z_SCHEMA = 10;

// TODO: decouple nodes and edges from controller callbacks
export const OssFlowState = ({ children }: React.PropsWithChildren) => {
  const { schema, setSelected } = useOssEdit();
  const { fitView } = useReactFlow();
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const [containMovement, setContainMovement] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));
    setSelected(prev => [
      ...prev.filter(nodeID => ids.includes(nodeID)),
      ...ids.filter(nodeID => !prev.includes(Number(nodeID)))
    ]);
  }

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  const resetGraph = useCallback(() => {
    const newNodes: Node[] = [
      ...schema.hierarchy
        .topologicalOrder()
        .filter(id => id < 0)
        .map(id => {
          const block = schema.blockByID.get(-id)!;
          return {
            id: String(id),
            type: 'block',
            data: { label: block.title, block: block },
            position: computeRelativePosition(schema, { x: block.x, y: block.y }, block.parent),
            style: {
              width: block.width,
              height: block.height
            },
            parentId: block.parent ? `-${block.parent}` : undefined,
            zIndex: Z_BLOCK
          };
        }),
      ...schema.operations.map(operation => ({
        id: String(operation.id),
        type: operation.operation_type.toString(),
        data: { label: operation.alias, operation: operation },
        position: computeRelativePosition(schema, { x: operation.x, y: operation.y }, operation.parent),
        parentId: operation.parent ? `-${operation.parent}` : undefined,
        zIndex: Z_SCHEMA
      }))
    ];

    const newEdges: Edge[] = schema.arguments.map((argument, index) => ({
      id: String(index),
      source: String(argument.argument),
      target: String(argument.operation),
      type: edgeStraight ? 'straight' : 'simplebezier',
      animated: edgeAnimate,
      targetHandle:
        schema.operationByID.get(argument.argument)!.x > schema.operationByID.get(argument.operation)!.x
          ? 'right'
          : 'left'
    }));

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => fitView(flowOptions.fitViewOptions), PARAMETER.refreshTimeout);
  }, [schema, setNodes, setEdges, edgeAnimate, edgeStraight, fitView]);

  useEffect(() => {
    resetGraph();
  }, [schema, edgeAnimate, edgeStraight, resetGraph]);

  function resetView() {
    setTimeout(() => fitView(flowOptions.fitViewOptions), PARAMETER.refreshTimeout);
  }

  return (
    <OssFlowContext
      value={{
        containMovement,
        setContainMovement,

        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,

        resetView,
        resetGraph
      }}
    >
      {children}
    </OssFlowContext>
  );
};

// ====== Internals =========
function computeRelativePosition(schema: IOperationSchema, position: Position2D, parent: number | null): Position2D {
  if (!parent) {
    return position;
  }

  const parentBlock = schema.blockByID.get(parent);
  if (!parentBlock) {
    return position;
  }

  return {
    x: position.x - parentBlock.x,
    y: position.y - parentBlock.y
  };
}
