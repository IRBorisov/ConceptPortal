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
import { OperationID } from '@/models/oss';
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

  const handleCreateOperation = useCallback(() => {
    const center = flow.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    controller.promptCreateOperation(center.x, center.y, getPositions());
  }, [controller, getPositions, flow]);

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

  const handleNodeClick = useCallback(
    (event: CProps.EventMouse, node: OssNode) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        handleEditOperation(Number(node.id));
      }
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
        onNodeClick={handleNodeClick}
        proOptions={{ hideAttribution: true }}
        fitView
        nodeTypes={OssNodeTypes}
        maxZoom={2}
        minZoom={0.75}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[10, 10]}
        onNodeContextMenu={handleContextMenu}
        onClick={handleClickCanvas}
      >
        {showGrid ? <Background gap={10} /> : null}
      </ReactFlow>
    ),
    [
      nodes,
      edges,
      handleNodesChange,
      handleContextMenu,
      handleClickCanvas,
      onEdgesChange,
      handleNodeClick,
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
          onCreate={handleCreateOperation}
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
