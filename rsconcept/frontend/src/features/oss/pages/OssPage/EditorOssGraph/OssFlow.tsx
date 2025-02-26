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

import { Overlay } from '@/components/Container';
import { useMainHeight } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';

import { useMutatingOss } from '../../../backend/useMutatingOss';
import { useUpdatePositions } from '../../../backend/useUpdatePositions';
import { GRID_SIZE } from '../../../models/ossAPI';
import { type OssNode } from '../../../models/ossLayout';
import { useOperationTooltipStore } from '../../../stores/operationTooltip';
import { useOSSGraphStore } from '../../../stores/ossGraph';
import { useOssEdit } from '../OssEditContext';

import { OssNodeTypes } from './graph/OssNodeTypes';
import { type ContextMenuData, NodeContextMenu } from './NodeContextMenu';
import { ToolbarOssGraph } from './ToolbarOssGraph';
import { useGetPositions } from './useGetPositions';

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
  const { fitView, project } = useReactFlow();

  const isProcessing = useMutatingOss();

  const setHoverOperation = useOperationTooltipStore(state => state.setActiveOperation);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const getPositions = useGetPositions();
  const { updatePositions } = useUpdatePositions();

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
      schema.items.map(operation => ({
        id: String(operation.id),
        data: { label: operation.alias, operation: operation },
        position: { x: operation.position_x, y: operation.position_y },
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
          schema.operationByID.get(argument.argument)!.position_x >
          schema.operationByID.get(argument.operation)!.position_x
            ? 'right'
            : 'left'
      }))
    );
    setTimeout(() => fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING }), PARAMETER.refreshTimeout);
  }, [schema, setNodes, setEdges, toggleReset, edgeStraight, edgeAnimate, fitView]);

  function handleSavePositions() {
    const positions = getPositions();
    void updatePositions({ itemID: schema.id, positions: positions }).then(() => {
      positions.forEach(item => {
        const operation = schema.operationByID.get(item.id);
        if (operation) {
          operation.position_x = item.position_x;
          operation.position_y = item.position_y;
        }
      });
    });
  }

  function handleCreateOperation() {
    const targetPosition = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      oss: schema,
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      positions: getPositions(),
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
      positions: getPositions()
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
    <div tabIndex={-1} onKeyDown={handleKeyDown}>
      <Overlay
        position='top-[1.9rem] pt-1 right-1/2 translate-x-1/2'
        className='rounded-b-2xl cc-blur hover:bg-prim-100 hover:bg-opacity-50'
      >
        <ToolbarOssGraph
          onCreate={handleCreateOperation}
          onDelete={handleDeleteSelected}
          onResetPositions={() => setToggleReset(prev => !prev)}
        />
      </Overlay>

      <NodeContextMenu isOpen={isContextMenuOpen} onHide={() => setIsContextMenuOpen(false)} {...menuProps} />

      <div className='cc-fade-in relative w-[100vw]' style={{ height: mainHeight, fontFamily: 'Rubik' }}>
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
