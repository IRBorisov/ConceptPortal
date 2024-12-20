'use client';

import { toPng } from 'html-to-image';
import { useCallback, useEffect, useState } from 'react';
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

import { CProps } from '@/components/props';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { OssNode } from '@/models/miscellaneous';
import { OperationID } from '@/models/oss';
import { APP_COLORS } from '@/styling/color';
import { PARAMETER, storage } from '@/utils/constants';
import { errors } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';
import { OssNodeTypes } from './graph/OssNodeTypes';
import NodeContextMenu, { ContextMenuData } from './NodeContextMenu';
import ToolbarOssGraph from './ToolbarOssGraph';

const ZOOM_MAX = 2;
const ZOOM_MIN = 0.5;

interface OssFlowProps {
  isModified: boolean;
  setIsModified: (newValue: boolean) => void;
}

function OssFlow({ isModified, setIsModified }: OssFlowProps) {
  const { mainHeight } = useConceptOptions();
  const model = useOSS();
  const controller = useOssEdit();
  const flow = useReactFlow();

  const [showGrid, setShowGrid] = useLocalStorage<boolean>(storage.ossShowGrid, false);
  const [edgeAnimate, setEdgeAnimate] = useLocalStorage<boolean>(storage.ossEdgeAnimate, false);
  const [edgeStraight, setEdgeStraight] = useLocalStorage<boolean>(storage.ossEdgeStraight, false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData | undefined>(undefined);

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      const ids = nodes.map(node => Number(node.id));
      controller.setSelected(prev => [
        ...prev.filter(nodeID => ids.includes(nodeID)),
        ...ids.filter(nodeID => !prev.includes(Number(nodeID)))
      ]);
    },
    [controller]
  );

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    if (!model.schema) {
      setNodes([]);
      setEdges([]);
    } else {
      setNodes(
        model.schema.items.map(operation => ({
          id: String(operation.id),
          data: { label: operation.alias, operation: operation },
          position: { x: operation.position_x, y: operation.position_y },
          type: operation.operation_type.toString()
        }))
      );
      setEdges(
        model.schema.arguments.map((argument, index) => ({
          id: String(index),
          source: String(argument.argument),
          target: String(argument.operation),
          type: edgeStraight ? 'straight' : 'simplebezier',
          animated: edgeAnimate,
          targetHandle:
            model.schema!.operationByID.get(argument.argument)!.position_x >
            model.schema!.operationByID.get(argument.operation)!.position_x
              ? 'right'
              : 'left'
        }))
      );
    }
    setTimeout(() => {
      setIsModified(false);
    }, PARAMETER.graphRefreshDelay);
  }, [model.schema, setNodes, setEdges, setIsModified, toggleReset, edgeStraight, edgeAnimate]);

  function getPositions() {
    return nodes.map(node => ({
      id: Number(node.id),
      position_x: node.position.x,
      position_y: node.position.y
    }));
  }

  function handleNodesChange(changes: NodeChange[]) {
    if (changes.some(change => change.type === 'position' && change.position)) {
      setIsModified(true);
    }
    onNodesChange(changes);
  }

  function handleSavePositions() {
    controller.savePositions(getPositions(), () => setIsModified(false));
  }

  function handleCreateOperation(inputs: OperationID[]) {
    if (!controller.schema) {
      return;
    }
    const positions = getPositions();
    const target = flow.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    controller.promptCreateOperation({
      defaultX: target.x,
      defaultY: target.y,
      inputs: inputs,
      positions: positions,
      callback: () => flow.fitView({ duration: PARAMETER.zoomDuration })
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

  function handleCreateInput(target: OperationID) {
    controller.createInput(target, getPositions());
  }

  function handleEditSchema(target: OperationID) {
    controller.promptEditInput(target, getPositions());
  }

  function handleEditOperation(target: OperationID) {
    controller.promptEditOperation(target, getPositions());
  }

  function handleExecuteOperation(target: OperationID) {
    controller.executeOperation(target, getPositions());
  }

  function handleExecuteSelected() {
    if (controller.selected.length !== 1) {
      return;
    }
    handleExecuteOperation(controller.selected[0]);
  }

  function handleRelocateConstituents(target: OperationID) {
    controller.promptRelocateConstituents(target, getPositions());
  }

  function handleSaveImage() {
    if (!model.schema) {
      return;
    }
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
        a.setAttribute('download', `${model.schema?.alias ?? 'oss'}.png`);
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
    controller.setShowTooltip(false);
  }

  function handleContextMenuHide() {
    controller.setShowTooltip(true);
    setMenuProps(undefined);
  }

  function handleCanvasClick() {
    handleContextMenuHide();
  }

  function handleNodeDoubleClick(event: CProps.EventMouse, node: OssNode) {
    event.preventDefault();
    event.stopPropagation();
    if (node.data.operation.result) {
      controller.openOperationSchema(Number(node.id));
    } else {
      handleEditOperation(Number(node.id));
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (controller.isProcessing) {
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
      <Overlay position='top-[1.9rem] pt-1 right-1/2 translate-x-1/2' className='rounded-b-2xl cc-blur'>
        <ToolbarOssGraph
          isModified={isModified}
          showGrid={showGrid}
          edgeAnimate={edgeAnimate}
          edgeStraight={edgeStraight}
          onFitView={() => flow.fitView({ duration: PARAMETER.zoomDuration })}
          onCreate={() => handleCreateOperation(controller.selected)}
          onDelete={handleDeleteSelected}
          onEdit={() => handleEditOperation(controller.selected[0])}
          onExecute={handleExecuteSelected}
          onResetPositions={() => setToggleReset(prev => !prev)}
          onSavePositions={handleSavePositions}
          onSaveImage={handleSaveImage}
          toggleShowGrid={() => setShowGrid(prev => !prev)}
          toggleEdgeAnimate={() => setEdgeAnimate(prev => !prev)}
          toggleEdgeStraight={() => setEdgeStraight(prev => !prev)}
        />
      </Overlay>
      {menuProps ? (
        <NodeContextMenu
          onHide={handleContextMenuHide}
          onDelete={handleDeleteOperation}
          onCreateInput={handleCreateInput}
          onEditSchema={handleEditSchema}
          onEditOperation={handleEditOperation}
          onExecuteOperation={handleExecuteOperation}
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
