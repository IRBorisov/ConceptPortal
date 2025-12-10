'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Edge, useEdgesState, useNodesState, useOnSelectionChange, useReactFlow } from '@xyflow/react';

import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';

import { type IOperationSchema, NodeType } from '../../../models/oss';
import { constructNodeID } from '../../../models/oss-api';
import { type Position2D } from '../../../models/oss-layout';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { type OGNode, type OperationNodeType } from './graph/og-models';
import { flowOptions } from './oss-flow';
import { OssFlowContext } from './oss-flow-context';

const Z_BLOCK = 1;
const Z_SCHEMA = 10;

export const OssFlowState = ({ children }: React.PropsWithChildren) => {
  const { schema, selected, setSelected } = useOssEdit();
  const { fitView, viewportInitialized } = useReactFlow();
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const [containMovement, setContainMovement] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<OGNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevSelected = useRef<string[]>([]);

  const suppressRFSelection = useRef<boolean>(false);
  function onSelectionChange({ nodes }: { nodes: OGNode[] }) {
    if (suppressRFSelection.current) {
      return;
    }
    const ids = nodes.map(node => node.id);
    setSelected(prev => (prev.length === ids.length && prev.every((id, i) => id === ids[i]) ? prev : ids));
  }

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  const reloadData = useCallback(() => {
    const newNodes: OGNode[] = schema.hierarchy.topologicalOrder().map(nodeID => {
      const item = schema.itemByNodeID.get(nodeID)!;
      if (item.nodeType === NodeType.BLOCK) {
        return {
          id: nodeID,
          type: 'block',
          selected: prevSelected.current.includes(item.nodeID),
          data: { label: item.title, block: item },
          position: computeRelativePosition(schema, { x: item.x, y: item.y }, item.parent),
          style: {
            width: item.width,
            height: item.height
          },

          parentId: item.parent ? constructNodeID(NodeType.BLOCK, item.parent) : undefined,
          zIndex: Z_BLOCK
        };
      } else {
        return {
          id: item.nodeID,
          type: item.operation_type.toString() as OperationNodeType,
          selected: prevSelected.current.includes(item.nodeID),
          data: { label: item.alias, operation: item },
          position: computeRelativePosition(schema, { x: item.x, y: item.y }, item.parent),
          parentId: item.parent ? constructNodeID(NodeType.BLOCK, item.parent) : undefined,
          zIndex: Z_SCHEMA
        };
      }
    });

    const newEdges: Edge[] = schema.arguments.map((argument, index) => {
      const source = schema.operationByID.get(argument.argument)!;
      const target = schema.operationByID.get(argument.operation)!;
      return {
        id: String(index),
        source: source.nodeID,
        target: target.nodeID,
        type: edgeStraight ? 'straight' : 'simplebezier',
        animated: edgeAnimate,
        focusable: false,
        targetHandle: source.x > target.x ? 'right' : 'left',
        style: {
          stroke: APP_COLORS.border
        }
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [schema, setNodes, setEdges, edgeAnimate, edgeStraight]);

  useEffect(() => {
    reloadData();
  }, [schema, edgeAnimate, edgeStraight, reloadData]);

  function resetView() {
    setTimeout(() => void fitView(flowOptions.fitViewOptions), PARAMETER.refreshTimeout);
  }

  function resetGraph() {
    setSelected([]);
    prevSelected.current = [];
    reloadData();
    setTimeout(() => void fitView(flowOptions.fitViewOptions), PARAMETER.refreshTimeout);
  }

  useEffect(() => {
    if (!viewportInitialized) {
      return;
    }
    const hasChanged =
      prevSelected.current.length !== selected.length || prevSelected.current.some((id, i) => id !== selected[i]);
    if (!hasChanged) {
      return;
    }

    suppressRFSelection.current = true;

    prevSelected.current = selected;
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: selected.includes(node.id)
      }))
    );

    const frame = requestAnimationFrame(() => {
      suppressRFSelection.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [viewportInitialized, selected, setNodes]);

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
