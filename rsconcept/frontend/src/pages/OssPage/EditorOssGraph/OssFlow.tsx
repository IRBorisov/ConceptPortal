'use client';

import { toSvg } from 'html-to-image';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Background,
  getNodesBounds,
  getViewportForBounds,
  Node,
  NodeChange,
  NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow';

import { CProps } from '@/components/props';
import Overlay from '@/components/ui/Overlay';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { OssNode } from '@/models/miscellaneous';
import { OperationID, OperationType } from '@/models/oss';
import { PARAMETER, storage } from '@/utils/constants';
import { errors } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';
import InputNode from './InputNode';
import NodeContextMenu, { ContextMenuData } from './NodeContextMenu';
import OperationNode from './OperationNode';
import ToolbarOssGraph from './ToolbarOssGraph';

interface OssFlowProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function OssFlow({ isModified, setIsModified }: OssFlowProps) {
  const { calculateHeight, colors } = useConceptOptions();
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
      controller.setSelected(nodes.map(node => Number(node.id)));
    },
    [controller]
  );

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useLayoutEffect(() => {
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

  const getPositions = useCallback(
    () =>
      nodes.map(node => ({
        id: Number(node.id),
        position_x: node.position.x,
        position_y: node.position.y
      })),
    [nodes]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (changes.some(change => change.type === 'position' && change.position)) {
        setIsModified(true);
      }
      onNodesChange(changes);
    },
    [onNodesChange, setIsModified]
  );

  const handleSavePositions = useCallback(() => {
    controller.savePositions(getPositions(), () => setIsModified(false));
  }, [controller, getPositions, setIsModified]);

  const handleCreateOperation = useCallback(
    (inputs: OperationID[]) => () => {
      if (!controller.schema) {
        return;
      }

      let target = { x: 0, y: 0 };
      const positions = getPositions();
      if (positions.length == 0) {
        target = flow.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
      if (inputs.length <= 1) {
        let inputsNodes = positions.filter(pos =>
          controller.schema!.items.find(
            operation => operation.operation_type === OperationType.INPUT && operation.id === pos.id
          )
        );
        if (inputsNodes.length > 0) {
          inputsNodes = positions;
        }
        const maxX = Math.max(...inputsNodes.map(node => node.position_x));
        const minY = Math.min(...inputsNodes.map(node => node.position_y));
        target.x = maxX + 180;
        target.y = minY;
      } else {
        const inputsNodes = positions.filter(pos => inputs.includes(pos.id));
        const maxY = Math.max(...inputsNodes.map(node => node.position_y));
        const minX = Math.min(...inputsNodes.map(node => node.position_x));
        const maxX = Math.max(...inputsNodes.map(node => node.position_x));
        target.x = Math.ceil((maxX + minX) / 2 / PARAMETER.ossGridSize) * PARAMETER.ossGridSize;
        target.y = maxY + 100;
      }

      let flagIntersect = false;
      do {
        flagIntersect = positions.some(
          position =>
            Math.abs(position.position_x - target.x) < PARAMETER.ossMinDistance &&
            Math.abs(position.position_y - target.y) < PARAMETER.ossMinDistance
        );
        if (flagIntersect) {
          target.x += PARAMETER.ossMinDistance;
          target.y += PARAMETER.ossMinDistance;
        }
      } while (flagIntersect);
      controller.promptCreateOperation({
        x: target.x,
        y: target.y,
        inputs: inputs,
        positions: positions,
        callback: () => flow.fitView({ duration: PARAMETER.zoomDuration })
      });
    },
    [controller, getPositions, flow]
  );

  const handleDeleteSelected = useCallback(() => {
    if (controller.selected.length !== 1) {
      return;
    }
    controller.deleteOperation(controller.selected[0], getPositions());
  }, [controller, getPositions]);

  const handleDeleteOperation = useCallback(
    (target: OperationID) => {
      controller.deleteOperation(target, getPositions());
    },
    [controller, getPositions]
  );

  const handleCreateInput = useCallback(
    (target: OperationID) => {
      controller.createInput(target, getPositions());
    },
    [controller, getPositions]
  );

  const handleEditSchema = useCallback(
    (target: OperationID) => {
      controller.promptEditInput(target, getPositions());
    },
    [controller, getPositions]
  );

  const handleEditOperation = useCallback(
    (target: OperationID) => {
      controller.promptEditOperation(target, getPositions());
    },
    [controller, getPositions]
  );

  const handleExecuteOperation = useCallback(
    (target: OperationID) => {
      controller.executeOperation(target, getPositions());
    },
    [controller, getPositions]
  );

  const handleExecuteSelected = useCallback(() => {
    if (controller.selected.length !== 1) {
      return;
    }
    handleExecuteOperation(controller.selected[0]);
  }, [controller, handleExecuteOperation]);

  const handleFitView = useCallback(() => {
    flow.fitView({ duration: PARAMETER.zoomDuration });
  }, [flow]);

  const handleResetPositions = useCallback(() => {
    setToggleReset(prev => !prev);
  }, []);

  const handleSaveImage = useCallback(() => {
    const canvas: HTMLElement | null = document.querySelector('.react-flow__viewport');
    if (canvas === null) {
      toast.error(errors.imageFailed);
      return;
    }

    const imageWidth = PARAMETER.ossImageWidth;
    const imageHeight = PARAMETER.ossImageHeight;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    toSvg(canvas, {
      backgroundColor: colors.bgDefault,
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
        a.setAttribute('download', 'reactflow.svg');
        a.setAttribute('href', dataURL);
        a.click();
      })
      .catch(error => {
        console.error(error);
        toast.error(errors.imageFailed);
      });
  }, [colors, nodes]);

  const handleContextMenu = useCallback(
    (event: CProps.EventMouse, node: OssNode) => {
      event.preventDefault();
      event.stopPropagation();

      setMenuProps({
        operation: node.data.operation,
        cursorX: event.clientX,
        cursorY: event.clientY
      });
      controller.setShowTooltip(false);
    },
    [controller]
  );

  const handleContextMenuHide = useCallback(() => {
    controller.setShowTooltip(true);
    setMenuProps(undefined);
  }, [controller]);

  const handleClickCanvas = useCallback(() => {
    handleContextMenuHide();
  }, [handleContextMenuHide]);

  const handleNodeDoubleClick = useCallback(
    (event: CProps.EventMouse, node: OssNode) => {
      event.preventDefault();
      event.stopPropagation();
      handleEditOperation(Number(node.id));
    },
    [handleEditOperation]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (controller.isProcessing) {
      return;
    }
    if (!controller.isMutable) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      event.stopPropagation();
      handleSavePositions();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
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

  const canvasWidth = useMemo(() => 'calc(100vw - 1rem)', []);
  const canvasHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);

  const OssNodeTypes: NodeTypes = useMemo(
    () => ({
      synthesis: OperationNode,
      input: InputNode
    }),
    []
  );

  const graph = useMemo(
    () => (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        proOptions={{ hideAttribution: true }}
        fitView
        nodeTypes={OssNodeTypes}
        maxZoom={2}
        minZoom={0.75}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[PARAMETER.ossGridSize, PARAMETER.ossGridSize]}
        onNodeContextMenu={handleContextMenu}
        onClick={handleClickCanvas}
      >
        {showGrid ? <Background gap={PARAMETER.ossGridSize} /> : null}
      </ReactFlow>
    ),
    [
      nodes,
      edges,
      handleNodesChange,
      handleContextMenu,
      handleClickCanvas,
      onEdgesChange,
      handleNodeDoubleClick,
      OssNodeTypes,
      showGrid
    ]
  );

  return (
    <AnimateFade tabIndex={-1} onKeyDown={handleKeyDown}>
      <Overlay position='top-0 pt-1 right-1/2 translate-x-1/2' className='rounded-b-2xl cc-blur'>
        <ToolbarOssGraph
          isModified={isModified}
          showGrid={showGrid}
          edgeAnimate={edgeAnimate}
          edgeStraight={edgeStraight}
          onFitView={handleFitView}
          onCreate={handleCreateOperation(controller.selected)}
          onDelete={handleDeleteSelected}
          onEdit={() => handleEditOperation(controller.selected[0])}
          onExecute={handleExecuteSelected}
          onResetPositions={handleResetPositions}
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
          {...menuProps}
        />
      ) : null}
      <div className='relative' style={{ height: canvasHeight, width: canvasWidth }}>
        {graph}
      </div>
    </AnimateFade>
  );
}

export default OssFlow;
