'use client';

import { useEffect, useState } from 'react';
import {
  Background,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow';

import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { GRID_SIZE } from '../../../models/oss-api';
import { type OssNode } from '../../../models/oss-layout';
import { useOperationTooltipStore } from '../../../stores/operation-tooltip';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { OssNodeTypes } from './graph/oss-node-types';
import { type ContextMenuData, NodeContextMenu } from './node-context-menu';
import { ToolbarOssGraph } from './toolbar-oss-graph';
import { useGetLayout } from './use-get-layout';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;
export const VIEW_PADDING = 0.2;

export function OssFlow() {
  const mainHeight = useMainHeight();
  const {
    navigateOperationSchema,
    schema,
    setSelected,
    selected,
    isMutable,
    canDeleteOperation: canDelete
  } = useOssEdit();
  const { fitView, screenToFlowPosition } = useReactFlow();

  const isProcessing = useMutatingOss();

  const setHoverOperation = useOperationTooltipStore(state => state.setActiveOperation);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const getLayout = useGetLayout();
  const { updateLayout: updatePositions } = useUpdateLayout();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData>({ operation: null, cursorX: 0, cursorY: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);

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

  useEffect(() => {
    setNodes(
      schema.operations.map(operation => ({
        id: String(operation.id),
        data: { label: operation.alias, operation: operation },
        position: { x: operation.x, y: operation.y },
        type: operation.operation_type.toString()
      }))
    );
    setEdges(
      schema.arguments.map((argument, index) => ({
        id: String(index),
        source: String(argument.argument),
        target: String(argument.operation),
        type: edgeStraight ? 'straight' : 'simplebezier',
        animated: edgeAnimate,
        targetHandle:
          schema.operationByID.get(argument.argument)!.x > schema.operationByID.get(argument.operation)!.x
            ? 'right'
            : 'left'
      }))
    );
    setTimeout(() => fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING }), PARAMETER.refreshTimeout);
  }, [schema, setNodes, setEdges, toggleReset, edgeStraight, edgeAnimate, fitView]);

  function handleSavePositions() {
    void updatePositions({ itemID: schema.id, data: getLayout() });
  }

  function handleCreateOperation() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      oss: schema,
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      layout: getLayout(),
      initialInputs: selected,
      onCreate: () =>
        setTimeout(() => fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING }), PARAMETER.refreshTimeout)
    });
  }

  function handleDeleteSelected() {
    if (selected.length !== 1) {
      return;
    }
    const operation = schema.operationByID.get(selected[0]);
    if (!operation || !canDelete(operation)) {
      return;
    }
    showDeleteOperation({
      oss: schema,
      target: operation,
      layout: getLayout()
    });
  }

  function handleContextMenu(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();

    setMenuProps({
      operation: node.data.operation,
      cursorX: event.clientX,
      cursorY: event.clientY
    });
    setIsContextMenuOpen(true);
    setHoverOperation(null);
  }

  function handleNodeDoubleClick(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();
    if (node.data.operation.result) {
      navigateOperationSchema(Number(node.id));
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing || !isMutable) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      event.preventDefault();
      event.stopPropagation();
      handleSavePositions();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      handleCreateOperation();
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      handleDeleteSelected();
      return;
    }
  }

  return (
    <div tabIndex={-1} className='relative' onKeyDown={handleKeyDown}>
      <ToolbarOssGraph
        className='absolute z-pop top-8 right-1/2 translate-x-1/2'
        onCreate={handleCreateOperation}
        onDelete={handleDeleteSelected}
        onResetPositions={() => setToggleReset(prev => !prev)}
      />

      <NodeContextMenu isOpen={isContextMenuOpen} onHide={() => setIsContextMenuOpen(false)} {...menuProps} />

      <div className='cc-fade-in relative w-[100vw] cc-mask-sides' style={{ height: mainHeight, fontFamily: 'Rubik' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edgesFocusable={false}
          nodesFocusable={false}
          fitView
          nodeTypes={OssNodeTypes}
          maxZoom={ZOOM_MAX}
          minZoom={ZOOM_MIN}
          nodesConnectable={false}
          snapToGrid={true}
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          onClick={() => setIsContextMenuOpen(false)}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={handleContextMenu}
          onNodeDragStart={() => setIsContextMenuOpen(false)}
        >
          {showGrid ? <Background gap={GRID_SIZE} /> : null}
        </ReactFlow>
      </div>
    </div>
  );
}
