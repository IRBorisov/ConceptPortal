'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { DiagramFlow, useReactFlow, useStoreApi } from '@/components/flow/diagram-flow';
import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';
import { promptText } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { useDeleteBlock } from '../../../backend/use-delete-block';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { type IOssItem, NodeType } from '../../../models/oss';
import { type OssNode, type Position2D } from '../../../models/oss-layout';
import { GRID_SIZE, LayoutManager } from '../../../models/oss-layout-api';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { ContextMenu } from './context-menu/context-menu';
import { useContextMenu } from './context-menu/use-context-menu';
import { OssNodeTypes } from './graph/oss-node-types';
import { CoordinateDisplay } from './coordinate-display';
import { useOssFlow } from './oss-flow-context';
import { SidePanel } from './side-panel';
import { ToolbarOssGraph } from './toolbar-oss-graph';
import { useDragging } from './use-dragging';
import { useGetLayout } from './use-get-layout';

export const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.3, duration: PARAMETER.zoomDuration },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 2,
  minZoom: 0.5,
  gridSize: GRID_SIZE,
  snapToGrid: true,
  snapGrid: [GRID_SIZE, GRID_SIZE] as [number, number]
} as const;

export function OssFlow() {
  const mainHeight = useMainHeight();
  const { navigateOperationSchema, schema, selected, selectedItems, isMutable, canDeleteOperation } = useOssEdit();
  const { screenToFlowPosition } = useReactFlow();
  const { containMovement, nodes, onNodesChange, edges, onEdgesChange, resetGraph, resetView } = useOssFlow();
  const store = useStoreApi();
  const { resetSelectedElements } = store.getState();

  const isProcessing = useMutatingOss();

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const showPanel = usePreferencesStore(state => state.showOssSidePanel);

  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { deleteBlock } = useDeleteBlock();

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });

  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);
  const showCreateBlock = useDialogsStore(state => state.showCreateBlock);
  const showCreateSchema = useDialogsStore(state => state.showCreateSchema);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showEditBlock = useDialogsStore(state => state.showEditBlock);
  const showImportSchema = useDialogsStore(state => state.showImportSchema);

  const { isOpen: isContextMenuOpen, menuProps, openContextMenu, hideContextMenu } = useContextMenu();
  const { handleDragStart, handleDrag, handleDragStop } = useDragging({ hideContextMenu });

  function handleSavePositions() {
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleCreateSynthesis() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialInputs: selectedItems.filter(item => item?.nodeType === NodeType.OPERATION).map(item => item.id),
      initialParent: extractBlockParent(selectedItems),
      onCreate: resetView
    });
  }

  function handleCreateBlock() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const parent = extractBlockParent(selectedItems);
    showCreateBlock({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialChildren:
        parent !== null && selectedItems.length === 1 && parent === selectedItems[0].id ? [] : selectedItems,
      initialParent: parent,
      onCreate: resetView
    });
  }

  function handleCreateSchema() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateSchema({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialParent: extractBlockParent(selectedItems),
      onCreate: resetView
    });
  }

  function handleImportSchema() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showImportSchema({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialParent: extractBlockParent(selectedItems),
      onCreate: resetView
    });
  }

  function handleDeleteSelected() {
    if (selected.length !== 1) {
      return;
    }
    const item = schema.itemByNodeID.get(selected[0]);
    if (!item) {
      return;
    }
    if (item.nodeType === NodeType.OPERATION) {
      if (!canDeleteOperation(item)) {
        return;
      }
      showDeleteOperation({
        oss: schema,
        target: item,
        layout: getLayout()
      });
    } else {
      if (!window.confirm(promptText.deleteBlock)) {
        return;
      }
      void deleteBlock({ itemID: schema.id, data: { target: item.id, layout: getLayout() } });
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
      if (node.data.operation) {
        navigateOperationSchema(node.data.operation.id);
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      withPreventDefault(resetSelectedElements)(event);
      return;
    }
    if (!isMutable) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      withPreventDefault(handleSavePositions)(event);
      return;
    }
    if (event.altKey) {
      if (event.code === 'Digit1') {
        withPreventDefault(handleCreateBlock)(event);
        return;
      }
      if (event.code === 'Digit2') {
        withPreventDefault(handleCreateSynthesis)(event);
        return;
      }
      if (event.code === 'Digit3') {
        withPreventDefault(handleImportSchema)(event);
        return;
      }
      if (event.code === 'Digit4') {
        withPreventDefault(handleCreateSynthesis)(event);
        return;
      }
    }
    if (event.key === 'Delete') {
      withPreventDefault(handleDeleteSelected)(event);
      return;
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const targetPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setMouseCoords(targetPosition);
  }

  function handleNodeContextMenu(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();
    openContextMenu(node, event.clientX, event.clientY);
  }

  return (
    <div tabIndex={-1} className='relative' onMouseMove={showCoordinates ? handleMouseMove : undefined}>
      {showCoordinates ? <CoordinateDisplay mouseCoords={mouseCoords} className='absolute top-1 right-2' /> : null}

      <ContextMenu isOpen={isContextMenuOpen} onHide={hideContextMenu} {...menuProps} />

      <ToolbarOssGraph
        className='cc-tab-tools'
        onCreateBlock={handleCreateBlock}
        onCreateSchema={handleCreateSchema}
        onImportSchema={handleImportSchema}
        onCreateSynthesis={handleCreateSynthesis}
        onDelete={handleDeleteSelected}
        onResetPositions={resetGraph}
        openContextMenu={openContextMenu}
        isContextMenuOpen={isContextMenuOpen}
        hideContextMenu={hideContextMenu}
      />

      <DiagramFlow
        {...flowOptions}
        className={clsx(!containMovement && 'cursor-relocate')}
        height={mainHeight}
        onKeyDown={handleKeyDown}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={OssNodeTypes}
        showGrid={showGrid}
        onClick={hideContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onContextMenu={hideContextMenu}
        onNodeDragStart={handleDragStart}
        onNodeDrag={handleDrag}
        onNodeDragStop={handleDragStop}
      />

      <SidePanel
        className={clsx(
          'absolute right-0 top-0 z-sticky w-84 min-h-80',
          'cc-animate-panel cc-shadow-left',
          showPanel ? 'translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        )}
        isMounted={showPanel}
      />
    </div>
  );
}

// -------- Internals --------
function extractBlockParent(selectedItems: IOssItem[]): number | null {
  if (selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK) {
    return selectedItems[0].id;
  }
  const parents = selectedItems.map(item => item.parent).filter(id => id !== null);
  return parents.length === 0 ? null : parents[0];
}
