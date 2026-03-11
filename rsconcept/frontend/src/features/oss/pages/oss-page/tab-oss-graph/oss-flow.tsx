'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type Connection } from '@xyflow/react';
import clsx from 'clsx';

import { useConceptNavigation } from '@/app';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { useContinuousPan } from '@/components/flow/use-continuous-panning';
import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { OperationType, type UpdateOperationDTO } from '../../../backend/types';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateOperation } from '../../../backend/use-update-operation';
import { NodeType } from '../../../models/oss';
import { type Position2D } from '../../../models/oss-layout';
import { GRID_SIZE } from '../../../models/oss-layout-api';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { ContextMenu } from './context-menu/context-menu';
import { useContextMenu } from './context-menu/use-context-menu';
import { OgConnectionLine } from './graph/og-connection';
import { type OGNode } from './graph/og-models';
import { OssGraphNodeTypes } from './graph/og-node-types';
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
  nodesConnectable: true,
  elevateNodesOnSelect: true,
  maxZoom: 2,
  minZoom: 0.5,
  gridSize: GRID_SIZE,
  snapToGrid: true,
  snapGrid: [GRID_SIZE, GRID_SIZE] as [number, number]
} as const;

export function OssFlow() {
  const router = useConceptNavigation();
  const mainHeight = useMainHeight();
  const { schema, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { screenToFlowPosition } = useReactFlow();
  const { containMovement, nodes, onNodesChange, edges, onEdgesChange } = useOssFlow();

  const flowRef = useRef<HTMLDivElement>(null);
  useContinuousPan(flowRef);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const showPanel = usePreferencesStore(state => state.showOssSidePanel);
  const { updateOperation } = useUpdateOperation();

  const getLayout = useGetLayout();

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });

  const showEditBlock = useDialogsStore(state => state.showEditBlock);
  const { isOpen: isContextMenuOpen, menuProps, openContextMenu, hideContextMenu } = useContextMenu();
  const { handleDragStart, handleDrag, handleDragStop } = useDragging({ hideContextMenu });
  const { handleKeyDown } = useHandleActions();

  function handleNodeDoubleClick(event: React.MouseEvent<Element>, node: OGNode) {
    event.preventDefault();
    event.stopPropagation();

    if (node.type === 'block') {
      const block = node.data.block;
      if (block) {
        showEditBlock({
          ossID: schema.id,
          layout: getLayout(),
          targetID: block.id
        });
      }
    } else {
      if (node.data.operation.result) {
        router.gotoCstList(node.data.operation.result);
      }
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const targetPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setMouseCoords(targetPosition);
  }

  function handleNodeContextMenu(event: React.MouseEvent<Element>, node: OGNode) {
    event.preventDefault();
    event.stopPropagation();
    openContextMenu(node, event.clientX, event.clientY);
  }

  function handleConnect(connection: Connection) {
    if (!isMutable || isProcessing) {
      return;
    }
    if (!connection.source || !connection.target) {
      return;
    }
    if (connection.source === connection.target) {
      toast.error(errorMsg.ossSelfConnection);
      return;
    }

    const source = schema.itemByNodeID.get(connection.source);
    const target = schema.itemByNodeID.get(connection.target);
    if (!source || target?.nodeType !== NodeType.OPERATION
      || target.operation_type !== OperationType.SYNTHESIS
    ) {
      throw new Error('Item not found');
    }
    if (schema.extendedGraph.expandAllOutputs([target.id]).includes(source.id)) {
      toast.error(errorMsg.ossCycle);
      return;
    }
    if (schema.graph.hasEdge(source.id, target.id)) {
      toast.error(errorMsg.connectionExists);
      return;
    }

    const data: UpdateOperationDTO = {
      target: target.id,
      item_data: {
        parent: target.parent,
        title: target.title,
        description: target.description,
        alias: target.alias
      },
      layout: getLayout(),
      arguments: [...target.arguments, source.id],
      substitutions: target.substitutions.map(sub => ({
        original: sub.original,
        substitution: sub.substitution
      }))
    };
    void updateOperation({ itemID: schema.id, data });
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
        nodeTypes={OssGraphNodeTypes}
        showGrid={showGrid}
        onClick={hideContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onContextMenu={hideContextMenu}
        onNodeDragStart={handleDragStart}
        onNodeDrag={handleDrag}
        onNodeDragStop={handleDragStop}

        connectionLineComponent={OgConnectionLine}
        // onConnectStart={handleConnectStart}
        // onConnectEnd={handleConnectEnd}
        onConnect={handleConnect}
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
