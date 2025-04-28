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
import clsx from 'clsx';

import { useThrottleCallback } from '@/hooks/use-throttle-callback';
import { useMainHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { promptText } from '@/utils/labels';

import { useDeleteBlock } from '../../../backend/use-delete-block';
import { useMoveItems } from '../../../backend/use-move-items';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { type IOperationSchema } from '../../../models/oss';
import { type OssNode, type Position2D } from '../../../models/oss-layout';
import { GRID_SIZE, LayoutManager } from '../../../models/oss-layout-api';
import { useOperationTooltipStore } from '../../../stores/operation-tooltip';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { ContextMenu, type ContextMenuData } from './context-menu/context-menu';
import { OssNodeTypes } from './graph/oss-node-types';
import { useOssFlow } from './oss-flow-context';
import { ToolbarOssGraph } from './toolbar-oss-graph';
import { useGetLayout } from './use-get-layout';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

const Z_BLOCK = 1;
const Z_SCHEMA = 10;

const DRAG_THROTTLE_DELAY = 50; // ms

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
  const { fitView, screenToFlowPosition, getIntersectingNodes } = useReactFlow();
  const { setDropTarget, setContainMovement, containMovement, setIsDragging } = useOssFlow();
  const store = useStoreApi();
  const { resetSelectedElements, addSelectedNodes } = store.getState();

  const isProcessing = useMutatingOss();

  const setHoverOperation = useOperationTooltipStore(state => state.setHoverItem);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { deleteBlock } = useDeleteBlock();
  const { moveItems } = useMoveItems();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData>({ item: null, cursorX: 0, cursorY: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const [mouseCoords, setMouseCoords] = useState<Position2D>({ x: 0, y: 0 });

  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);
  const showCreateBlock = useDialogsStore(state => state.showCreateBlock);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showEditBlock = useDialogsStore(state => state.showEditBlock);

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
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialInputs: selected.filter(id => id > 0),
      initialParent: extractSingleBlock(selected),
      onCreate: () =>
        setTimeout(() => fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING }), PARAMETER.refreshTimeout)
    });
  }

  function handleCreateBlock() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateBlock({
      manager: new LayoutManager(schema, getLayout()),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
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

    addSelectedNodes([node.id]);

    setMenuProps({
      item: node.type === 'block' ? node.data.block ?? null : node.data.operation ?? null,
      cursorX: event.clientX,
      cursorY: event.clientY
    });
    setIsContextMenuOpen(true);
    setHoverOperation(null);
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

  function determineDropTarget(event: React.MouseEvent): number | null {
    const mousePosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let blocks = getIntersectingNodes({
      x: mousePosition.x,
      y: mousePosition.y,
      width: 1,
      height: 1
    })
      .map(node => Number(node.id))
      .filter(id => id < 0 && !selected.includes(id))
      .map(id => schema.blockByID.get(-id))
      .filter(block => !!block);

    if (blocks.length === 0) {
      return null;
    }

    const successors = schema.hierarchy.expandAllOutputs([...selected]).filter(id => id < 0);
    blocks = blocks.filter(block => !successors.includes(-block.id));
    if (blocks.length === 0) {
      return null;
    }
    if (blocks.length === 1) {
      return blocks[0].id;
    }

    const parents = blocks.map(block => block.parent).filter(id => !!id);
    const potentialTargets = blocks.map(block => block.id).filter(id => !parents.includes(id));
    if (potentialTargets.length === 0) {
      return null;
    } else {
      return potentialTargets[0];
    }
  }

  function handleDragStart(event: React.MouseEvent, target: Node) {
    if (event.shiftKey) {
      setContainMovement(true);
      setNodes(prev =>
        prev.map(node =>
          node.id === target.id || selected.includes(Number(node.id))
            ? {
                ...node,
                extent: 'parent',
                expandParent: true
              }
            : node
        )
      );
    } else {
      setContainMovement(false);
      setDropTarget(determineDropTarget(event));
    }
    setIsContextMenuOpen(false);
  }

  const handleDrag = useThrottleCallback((event: React.MouseEvent) => {
    if (containMovement) {
      return;
    }
    setIsDragging(true);
    setDropTarget(determineDropTarget(event));
  }, DRAG_THROTTLE_DELAY);

  function handleDragStop(event: React.MouseEvent, target: Node) {
    if (containMovement) {
      setNodes(prev =>
        prev.map(node =>
          node.id === target.id || selected.includes(Number(node.id))
            ? {
                ...node,
                extent: undefined,
                expandParent: undefined
              }
            : node
        )
      );
    } else {
      const new_parent = determineDropTarget(event);
      const allSelected = [...selected.filter(id => id != Number(target.id)), Number(target.id)];
      const operations = allSelected
        .filter(id => id > 0)
        .map(id => schema.operationByID.get(id))
        .filter(operation => !!operation);
      const blocks = allSelected
        .filter(id => id < 0)
        .map(id => schema.blockByID.get(-id))
        .filter(operation => !!operation);
      const parents = [...blocks.map(block => block.parent), ...operations.map(operation => operation.parent)].filter(
        id => !!id
      );
      if ((parents.length !== 1 || parents[0] !== new_parent) && (parents.length !== 0 || new_parent !== null)) {
        void moveItems({
          itemID: schema.id,
          data: {
            layout: getLayout(),
            operations: operations.map(operation => operation.id),
            blocks: blocks.map(block => block.id),
            destination: new_parent
          }
        });
      }
    }
    setIsDragging(false);
    setContainMovement(false);
    setDropTarget(null);
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

      <ContextMenu isOpen={isContextMenuOpen} onHide={() => setIsContextMenuOpen(false)} {...menuProps} />

      <div
        className={clsx('relative w-[100vw] cc-mask-sides', !containMovement && 'cursor-relocate')}
        style={{ height: mainHeight, fontFamily: 'Rubik' }}
      >
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
          onContextMenu={event => event.preventDefault()}
          onNodeDragStart={handleDragStart}
          onNodeDrag={handleDrag}
          onNodeDragStop={handleDragStop}
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
