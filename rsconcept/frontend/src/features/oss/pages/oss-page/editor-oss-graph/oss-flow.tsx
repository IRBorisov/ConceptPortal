'use client';

import { useState } from 'react';
import { Background, ReactFlow, useReactFlow, useStoreApi } from 'reactflow';
import clsx from 'clsx';

import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { promptText } from '@/utils/labels';

import { useDeleteBlock } from '../../../backend/use-delete-block';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { type OssNode, type Position2D } from '../../../models/oss-layout';
import { GRID_SIZE, LayoutManager } from '../../../models/oss-layout-api';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { ContextMenu } from './context-menu/context-menu';
import { useContextMenu } from './context-menu/use-context-menu';
import { OssNodeTypes } from './graph/oss-node-types';
import { CoordinateDisplay } from './coordinate-display';
import { useOssFlow } from './oss-flow-context';
import { ToolbarOssGraph } from './toolbar-oss-graph';
import { useDragging } from './use-dragging';
import { useGetLayout } from './use-get-layout';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

export function OssFlow() {
  const mainHeight = useMainHeight();
  const { navigateOperationSchema, schema, selected, isMutable, canDeleteOperation } = useOssEdit();
  const { screenToFlowPosition } = useReactFlow();
  const { containMovement, nodes, onNodesChange, edges, onEdgesChange, resetGraph, resetView } = useOssFlow();
  const store = useStoreApi();
  const { resetSelectedElements } = store.getState();

  const isProcessing = useMutatingOss();

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);

  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { deleteBlock } = useDeleteBlock();

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);
  const showCreateBlock = useDialogsStore(state => state.showCreateBlock);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showEditBlock = useDialogsStore(state => state.showEditBlock);

  const { isOpen: isContextMenuOpen, menuProps, handleContextMenu, hideContextMenu } = useContextMenu();
  const { handleDragStart, handleDrag, handleDragStop } = useDragging({ hideContextMenu });

  function handleSavePositions() {
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleCreateOperation() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialInputs: selected.filter(id => id > 0),
      initialParent: extractSingleBlock(selected),
      onCreate: resetView
    });
  }

  function handleCreateBlock() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateBlock({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialInputs: selected,
      onCreate: resetView
    });
  }

  function handleDeleteSelected() {
    if (selected.length !== 1) {
      return;
    }
    if (selected[0] > 0) {
      const operation = schema.operationByID.get(selected[0]);
      if (!operation || !canDeleteOperation(operation)) {
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

  function handleNodeDoubleClick(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();

    if (node.type === 'block') {
      const block = schema.blockByID.get(-Number(node.id));
      if (block) {
        showEditBlock({
          manager: new LayoutManager(schema, getLayout()),
          target: block
        });
      }
    } else {
      if (node.data.operation?.result) {
        navigateOperationSchema(Number(node.id));
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      setSpacePressed(true);
      return;
    }
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

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      setSpacePressed(false);
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
      onKeyUp={handleKeyUp}
      onMouseMove={showCoordinates ? handleMouseMove : undefined}
    >
      {showCoordinates ? <CoordinateDisplay mouseCoords={mouseCoords} className='absolute top-1 right-2' /> : null}
      <ToolbarOssGraph
        className='absolute z-pop top-8 right-1/2 translate-x-1/2'
        onCreateOperation={handleCreateOperation}
        onCreateBlock={handleCreateBlock}
        onDelete={handleDeleteSelected}
        onResetPositions={resetGraph}
      />

      <ContextMenu isOpen={isContextMenuOpen} onHide={hideContextMenu} {...menuProps} />

      <div
        className={clsx(
          'relative w-[100vw] cc-mask-sides',
          spacePressed ? 'space-mode' : '',
          !containMovement && 'cursor-relocate'
        )}
        style={{ height: mainHeight, fontFamily: 'Rubik' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={spacePressed ? undefined : onNodesChange}
          onEdgesChange={spacePressed ? undefined : onEdgesChange}
          edgesFocusable={false}
          nodesFocusable={false}
          fitView
          nodeTypes={OssNodeTypes}
          maxZoom={ZOOM_MAX}
          minZoom={ZOOM_MIN}
          nodesConnectable={false}
          snapToGrid={true}
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          onClick={hideContextMenu}
          onNodeDoubleClick={spacePressed ? undefined : handleNodeDoubleClick}
          onNodeContextMenu={handleContextMenu}
          onContextMenu={event => {
            event.preventDefault();
            hideContextMenu();
          }}
          nodesDraggable={!spacePressed}
          onNodeDragStart={spacePressed ? undefined : handleDragStart}
          onNodeDrag={spacePressed ? undefined : handleDrag}
          onNodeDragStop={spacePressed ? undefined : handleDragStop}
        >
          {showGrid ? <Background gap={GRID_SIZE} /> : null}
        </ReactFlow>
      </div>
    </div>
  );
}

// -------- Internals --------
function extractSingleBlock(selected: number[]): number | null {
  const blocks = selected.filter(id => id < 0);
  return blocks.length === 1 ? -blocks[0] : null;
}
