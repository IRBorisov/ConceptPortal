'use client';

import { useEffect, useState } from 'react';
import {
  Background,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow,
  useStoreApi
} from 'reactflow';

import { useDeleteBlock } from '@/features/oss/backend/use-delete-block';
import { type IOperationSchema } from '@/features/oss/models/oss';

import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { promptText } from '@/utils/labels';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { GRID_SIZE } from '../../../models/oss-api';
import { type OssNode, type Position2D } from '../../../models/oss-layout';
import { useOperationTooltipStore } from '../../../stores/operation-tooltip';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { OssNodeTypes } from './graph/oss-node-types';
import { type ContextMenuData, NodeContextMenu } from './node-context-menu';
import { ToolbarOssGraph } from './toolbar-oss-graph';
import { useGetLayout } from './use-get-layout';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

const Z_BLOCK = 1;
const Z_SCHEMA = 10;

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
  const store = useStoreApi();
  const { resetSelectedElements } = store.getState();

  const isProcessing = useMutatingOss();

  const setHoverOperation = useOperationTooltipStore(state => state.setActiveOperation);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { deleteBlock } = useDeleteBlock();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData>({ operation: null, cursorX: 0, cursorY: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });

  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);
  const showCreateBlock = useDialogsStore(state => state.showCreateBlock);
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
    setNodes([
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
            expandParent: true,
            extent: 'parent' as const,
            zIndex: Z_BLOCK
          };
        }),
      ...schema.operations.map(operation => ({
        id: String(operation.id),
        type: operation.operation_type.toString(),
        data: { label: operation.alias, operation: operation },
        position: computeRelativePosition(schema, { x: operation.x, y: operation.y }, operation.parent),
        parentId: operation.parent ? `-${operation.parent}` : undefined,
        expandParent: true,
        extent: 'parent' as const,
        zIndex: Z_SCHEMA
      }))
    ]);
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
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleCreateOperation() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      oss: schema,
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      layout: getLayout(),
      initialInputs: selected.filter(id => id > 0),
      initialParent: extractSingleBlock(selected),
      onCreate: () =>
        setTimeout(() => fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING }), PARAMETER.refreshTimeout)
    });
  }

  function handleCreateBlock() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateBlock({
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
    if (selected[0] > 0) {
      const operation = schema.operationByID.get(selected[0]);
      if (!operation || !canDelete(operation)) {
        return;
      }
      showDeleteOperation({
        oss: schema,
        target: operation,
        layout: getLayout()
      });
    } else {
      const block = schema.blockByID.get(-selected[0]);
      if (!block) {
        return;
      }
      if (!window.confirm(promptText.deleteBlock)) {
        return;
      }
      void deleteBlock({ itemID: schema.id, data: { target: block.id, layout: getLayout() } });
    }
  }

  function handleContextMenu(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();

    if (node.type === 'block') {
      return;
    }

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
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      resetSelectedElements();
      return;
    }
    if (!isMutable) {
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
      if (event.shiftKey) {
        handleCreateBlock();
      } else {
        handleCreateOperation();
      }
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      handleDeleteSelected();
      return;
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const targetPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setMouseCoords(targetPosition);
  }

  return (
    <div
      tabIndex={-1}
      className='relative'
      onKeyDown={handleKeyDown}
      onMouseMove={showCoordinates ? handleMouseMove : undefined}
    >
      {showCoordinates ? (
        <div className='absolute top-1 right-2 hover:bg-background backdrop-blur-xs text-sm font-math'>
          {`X: ${mouseCoords.x.toFixed(0)} Y: ${mouseCoords.y.toFixed(0)}`}
        </div>
      ) : null}
      <ToolbarOssGraph
        className='absolute z-pop top-8 right-1/2 translate-x-1/2'
        onCreateOperation={handleCreateOperation}
        onCreateBlock={handleCreateBlock}
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

// -------- Internals --------
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

function extractSingleBlock(selected: number[]): number | null {
  const blocks = selected.filter(id => id < 0);
  return blocks.length === 1 ? -blocks[0] : null;
}
