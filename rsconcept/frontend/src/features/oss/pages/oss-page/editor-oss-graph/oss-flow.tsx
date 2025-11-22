'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { useContinuousPan } from '@/components/flow/use-continuous-panning';
import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';

import { type OssNode, type Position2D } from '../../../models/oss-layout';
import { GRID_SIZE } from '../../../models/oss-layout-api';
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
import { useHandleActions } from './use-handle-actions';

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
  const { navigateOperationSchema, schema } = useOssEdit();
  const { screenToFlowPosition } = useReactFlow();
  const { containMovement, nodes, onNodesChange, edges, onEdgesChange } = useOssFlow();

  const flowRef = useRef<HTMLDivElement>(null);
  useContinuousPan(flowRef);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const showPanel = usePreferencesStore(state => state.showOssSidePanel);

  const getLayout = useGetLayout();

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });

  const showEditBlock = useDialogsStore(state => state.showEditBlock);
  const { isOpen: isContextMenuOpen, menuProps, openContextMenu, hideContextMenu } = useContextMenu();
  const { handleDragStart, handleDrag, handleDragStop } = useDragging({ hideContextMenu });
  const { handleKeyDown } = useHandleActions();

  function handleNodeDoubleClick(event: React.MouseEvent<Element>, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();

    if (node.type === 'block') {
      const block = schema.blockByID.get(-Number(node.id));
      if (block) {
        showEditBlock({
          ossID: schema.id,
          layout: getLayout(),
          targetID: block.id
        });
      }
    } else {
      if (node.data.operation) {
        navigateOperationSchema(node.data.operation.id);
      }
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
    <div
      ref={flowRef}
      tabIndex={-1}
      className='relative'
      onMouseMove={showCoordinates ? handleMouseMove : undefined}
      onKeyDown={handleKeyDown}
    >
      {showCoordinates ? <CoordinateDisplay mouseCoords={mouseCoords} className='absolute top-1 right-2' /> : null}

      <ContextMenu isOpen={isContextMenuOpen} onHide={hideContextMenu} {...menuProps} />

      <ToolbarOssGraph
        className='cc-tab-tools'
        openContextMenu={openContextMenu}
        isContextMenuOpen={isContextMenuOpen}
        hideContextMenu={hideContextMenu}
      />

      <DiagramFlow
        {...flowOptions}
        className={clsx(!containMovement && 'cursor-relocate')}
        height={mainHeight}
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
