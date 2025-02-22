'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Background,
  getNodesBounds,
  getViewportForBounds,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow';
import { toPng } from 'html-to-image';

import { urls, useConceptNavigation } from '@/app';
import { useLibrary } from '@/features/library';

import { Overlay } from '@/components/Container';
import { useMainHeight } from '@/stores/appLayout';
import { useTooltipsStore } from '@/stores/tooltips';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { useInputCreate } from '../../../backend/useInputCreate';
import { useMutatingOss } from '../../../backend/useMutatingOss';
import { useOperationExecute } from '../../../backend/useOperationExecute';
import { useUpdatePositions } from '../../../backend/useUpdatePositions';
import { GRID_SIZE } from '../../../models/ossAPI';
import { type OssNode } from '../../../models/ossLayout';
import { useOSSGraphStore } from '../../../stores/ossGraph';
import { useOssEdit } from '../OssEditContext';

import { OssNodeTypes } from './graph/OssNodeTypes';
import { type ContextMenuData, NodeContextMenu } from './NodeContextMenu';
import { ToolbarOssGraph } from './ToolbarOssGraph';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

export function OssFlow() {
  const mainHeight = useMainHeight();
  const {
    navigateOperationSchema,
    schema,
    setSelected,
    selected,
    isMutable,
    promptCreateOperation,
    canDelete,
    promptDeleteOperation,
    promptEditInput,
    promptEditOperation,
    promptRelocateConstituents
  } = useOssEdit();
  const router = useConceptNavigation();
  const { items: libraryItems } = useLibrary();
  const flow = useReactFlow();

  const isProcessing = useMutatingOss();

  const setHoverOperation = useTooltipsStore(state => state.setActiveOperation);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const { inputCreate } = useInputCreate();
  const { operationExecute } = useOperationExecute();
  const { updatePositions } = useUpdatePositions();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

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
  }, [schema, setNodes, setEdges, toggleReset, edgeStraight, edgeAnimate]);

  function getPositions() {
    return nodes.map(node => ({
      id: Number(node.id),
      position_x: node.position.x,
      position_y: node.position.y
    }));
  }

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

  function handleCreateOperation(inputs: number[]) {
    const positions = getPositions();
    const target = flow.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    promptCreateOperation({
      defaultX: target.x,
      defaultY: target.y,
      inputs: inputs,
      positions: positions,
      callback: () => setTimeout(() => flow.fitView({ duration: PARAMETER.zoomDuration }), PARAMETER.refreshTimeout)
    });
  }

  function handleDeleteOperation(target: number) {
    if (!canDelete(target)) {
      return;
    }
    promptDeleteOperation(target, getPositions());
  }

  function handleDeleteSelected() {
    if (selected.length !== 1) {
      return;
    }
    handleDeleteOperation(selected[0]);
  }

  function handleInputCreate(target: number) {
    const operation = schema.operationByID.get(target);
    if (!operation) {
      return;
    }
    if (libraryItems.find(item => item.alias === operation.alias && item.location === schema.location)) {
      toast.error(errorMsg.inputAlreadyExists);
      return;
    }
    void inputCreate({
      itemID: schema.id,
      data: { target: target, positions: getPositions() }
    }).then(new_schema => router.push(urls.schema(new_schema.id)));
  }

  function handleEditSchema(target: number) {
    promptEditInput(target, getPositions());
  }

  function handleEditOperation(target: number) {
    promptEditOperation(target, getPositions());
  }

  function handleOperationExecute(target: number) {
    void operationExecute({
      itemID: schema.id, //
      data: { target: target, positions: getPositions() }
    });
  }

  function handleExecuteSelected() {
    if (selected.length !== 1) {
      return;
    }
    handleOperationExecute(selected[0]);
  }

  function handleRelocateConstituents(target: number) {
    promptRelocateConstituents(target, getPositions());
  }

  function handleSaveImage() {
    const canvas: HTMLElement | null = document.querySelector('.react-flow__viewport');
    if (canvas === null) {
      toast.error(errorMsg.imageFailed);
      return;
    }

    const imageWidth = PARAMETER.ossImageWidth;
    const imageHeight = PARAMETER.ossImageHeight;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, ZOOM_MIN, ZOOM_MAX);
    toPng(canvas, {
      backgroundColor: APP_COLORS.bgDefault,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: String(imageWidth),
        height: String(imageHeight),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
      }
    })
      .then(dataURL => {
        const a = document.createElement('a');
        a.setAttribute('download', `${schema.alias}.png`);
        a.setAttribute('href', dataURL);
        a.click();
      })
      .catch(error => {
        console.error(error);
        toast.error(errorMsg.imageFailed);
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

  function handleContextMenuHide() {
    setIsContextMenuOpen(false);
  }

  function handleCanvasClick() {
    handleContextMenuHide();
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
      handleCreateOperation(selected);
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
          onFitView={() => flow.fitView({ duration: PARAMETER.zoomDuration })}
          onCreate={() => handleCreateOperation(selected)}
          onDelete={handleDeleteSelected}
          onEdit={() => handleEditOperation(selected[0])}
          onExecute={handleExecuteSelected}
          onResetPositions={() => setToggleReset(prev => !prev)}
          onSavePositions={handleSavePositions}
          onSaveImage={handleSaveImage}
        />
      </Overlay>
      {menuProps ? (
        <NodeContextMenu
          isOpen={isContextMenuOpen}
          onHide={handleContextMenuHide}
          onDelete={handleDeleteOperation}
          onCreateInput={handleInputCreate}
          onEditSchema={handleEditSchema}
          onEditOperation={handleEditOperation}
          onExecuteOperation={handleOperationExecute}
          onRelocateConstituents={handleRelocateConstituents}
          {...menuProps}
        />
      ) : null}
      <div className='cc-fade-in relative w-[100vw]' style={{ height: mainHeight, fontFamily: 'Rubik' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          edgesFocusable={false}
          nodesFocusable={false}
          fitView
          nodeTypes={OssNodeTypes}
          maxZoom={ZOOM_MAX}
          minZoom={ZOOM_MIN}
          nodesConnectable={false}
          snapToGrid={true}
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          onNodeContextMenu={handleContextMenu}
          onClick={handleCanvasClick}
        >
          {showGrid ? <Background gap={GRID_SIZE} /> : null}
        </ReactFlow>
      </div>
    </div>
  );
}
