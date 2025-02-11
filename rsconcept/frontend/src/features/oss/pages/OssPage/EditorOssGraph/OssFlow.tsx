'use client';

import { toPng } from 'html-to-image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Background,
  getNodesBounds,
  getViewportForBounds,
  Node,
  NodeChange,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow';

import { urls, useConceptNavigation } from '@/app';
import { Overlay } from '@/components/Container';
import { CProps } from '@/components/props';
import { useLibrary } from '@/features/library/backend/useLibrary';
import { useMainHeight } from '@/stores/appLayout';
import { useModificationStore } from '@/stores/modification';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';
import { errors } from '@/utils/labels';

import { useInputCreate } from '../../../backend/useInputCreate';
import { useMutatingOss } from '../../../backend/useMutatingOss';
import { useOperationExecute } from '../../../backend/useOperationExecute';
import { useUpdatePositions } from '../../../backend/useUpdatePositions';
import { OperationID } from '../../../models/oss';
import { OssNode } from '../../../models/ossLayout';
import { useOSSGraphStore } from '../../../stores/ossGraph';
import { useOssEdit } from '../OssEditContext';
import { OssNodeTypes } from './graph/OssNodeTypes';
import NodeContextMenu, { ContextMenuData } from './NodeContextMenu';
import ToolbarOssGraph from './ToolbarOssGraph';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

function OssFlow() {
  const mainHeight = useMainHeight();
  const controller = useOssEdit();
  const router = useConceptNavigation();
  const { items: libraryItems } = useLibrary();
  const flow = useReactFlow();
  const { setIsModified } = useModificationStore();

  const isProcessing = useMutatingOss();

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);

  const { inputCreate } = useInputCreate();
  const { operationExecute } = useOperationExecute();
  const { updatePositions } = useUpdatePositions();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData>({ operation: undefined, cursorX: 0, cursorY: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));
    controller.setSelected(prev => [
      ...prev.filter(nodeID => ids.includes(nodeID)),
      ...ids.filter(nodeID => !prev.includes(Number(nodeID)))
    ]);
  }

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    setNodes(
      controller.schema.items.map(operation => ({
        id: String(operation.id),
        data: { label: operation.alias, operation: operation },
        position: { x: operation.position_x, y: operation.position_y },
        type: operation.operation_type.toString()
      }))
    );
    setEdges(
      controller.schema.arguments.map((argument, index) => ({
        id: String(index),
        source: String(argument.argument),
        target: String(argument.operation),
        type: edgeStraight ? 'straight' : 'simplebezier',
        animated: edgeAnimate,
        targetHandle:
          controller.schema.operationByID.get(argument.argument)!.position_x >
          controller.schema.operationByID.get(argument.operation)!.position_x
            ? 'right'
            : 'left'
      }))
    );

    setTimeout(() => {
      setIsModified(false);
    }, PARAMETER.graphRefreshDelay);
  }, [controller.schema, setNodes, setEdges, setIsModified, toggleReset, edgeStraight, edgeAnimate]);

  function getPositions() {
    return nodes.map(node => ({
      id: Number(node.id),
      position_x: node.position.x,
      position_y: node.position.y
    }));
  }

  function handleNodesChange(changes: NodeChange[]) {
    if (controller.isMutable && changes.some(change => change.type === 'position' && change.position)) {
      setIsModified(true);
    }
    onNodesChange(changes);
  }

  function handleSavePositions() {
    const positions = getPositions();
    void updatePositions({ itemID: controller.schema.id, positions: positions }).then(() => {
      positions.forEach(item => {
        const operation = controller.schema.operationByID.get(item.id);
        if (operation) {
          operation.position_x = item.position_x;
          operation.position_y = item.position_y;
        }
      });
      setIsModified(false);
    });
  }

  function handleCreateOperation(inputs: OperationID[]) {
    const positions = getPositions();
    const target = flow.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    controller.promptCreateOperation({
      defaultX: target.x,
      defaultY: target.y,
      inputs: inputs,
      positions: positions,
      callback: () => setTimeout(() => flow.fitView({ duration: PARAMETER.zoomDuration }), PARAMETER.refreshTimeout)
    });
  }

  function handleDeleteOperation(target: OperationID) {
    if (!controller.canDelete(target)) {
      return;
    }
    controller.promptDeleteOperation(target, getPositions());
  }

  function handleDeleteSelected() {
    if (controller.selected.length !== 1) {
      return;
    }
    handleDeleteOperation(controller.selected[0]);
  }

  function handleInputCreate(target: OperationID) {
    const operation = controller.schema.operationByID.get(target);
    if (!operation) {
      return;
    }
    if (libraryItems.find(item => item.alias === operation.alias && item.location === controller.schema.location)) {
      toast.error(errors.inputAlreadyExists);
      return;
    }
    void inputCreate({
      itemID: controller.schema.id,
      data: { target: target, positions: getPositions() }
    }).then(new_schema => router.push(urls.schema(new_schema.id)));
  }

  function handleEditSchema(target: OperationID) {
    controller.promptEditInput(target, getPositions());
  }

  function handleEditOperation(target: OperationID) {
    controller.promptEditOperation(target, getPositions());
  }

  function handleOperationExecute(target: OperationID) {
    void operationExecute({
      itemID: controller.schema.id, //
      data: { target: target, positions: getPositions() }
    });
  }

  function handleExecuteSelected() {
    if (controller.selected.length !== 1) {
      return;
    }
    handleOperationExecute(controller.selected[0]);
  }

  function handleRelocateConstituents(target: OperationID) {
    controller.promptRelocateConstituents(target, getPositions());
  }

  function handleSaveImage() {
    const canvas: HTMLElement | null = document.querySelector('.react-flow__viewport');
    if (canvas === null) {
      toast.error(errors.imageFailed);
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
        a.setAttribute('download', `${controller.schema.alias}.png`);
        a.setAttribute('href', dataURL);
        a.click();
      })
      .catch(error => {
        console.error(error);
        toast.error(errors.imageFailed);
      });
  }

  function handleContextMenu(event: CProps.EventMouse, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();

    setMenuProps({
      operation: node.data.operation,
      cursorX: event.clientX,
      cursorY: event.clientY
    });
    setIsContextMenuOpen(true);
    controller.setShowTooltip(false);
  }

  function handleContextMenuHide() {
    controller.setShowTooltip(true);
    setIsContextMenuOpen(false);
  }

  function handleCanvasClick() {
    handleContextMenuHide();
  }

  function handleNodeDoubleClick(event: CProps.EventMouse, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();
    if (node.data.operation.result) {
      controller.navigateOperationSchema(Number(node.id));
    } else {
      handleEditOperation(Number(node.id));
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (!controller.isMutable) {
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
      handleCreateOperation(controller.selected);
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
          onCreate={() => handleCreateOperation(controller.selected)}
          onDelete={handleDeleteSelected}
          onEdit={() => handleEditOperation(controller.selected[0])}
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
          onNodesChange={handleNodesChange}
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
          snapGrid={[PARAMETER.ossGridSize, PARAMETER.ossGridSize]}
          onNodeContextMenu={handleContextMenu}
          onClick={handleCanvasClick}
        >
          {showGrid ? <Background gap={PARAMETER.ossGridSize} /> : null}
        </ReactFlow>
      </div>
    </div>
  );
}

export default OssFlow;
