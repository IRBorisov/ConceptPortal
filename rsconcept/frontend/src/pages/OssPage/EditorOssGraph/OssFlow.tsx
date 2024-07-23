'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  Node,
  NodeChange,
  NodeTypes,
  ProOptions,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow';

import Overlay from '@/components/ui/Overlay';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';
import { PARAMETER } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';
import InputNode from './InputNode';
import OperationNode from './OperationNode';
import ToolbarOssGraph from './ToolbarOssGraph';

interface OssFlowProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function OssFlow({ isModified, setIsModified }: OssFlowProps) {
  const { calculateHeight } = useConceptOptions();
  const model = useOSS();
  const controller = useOssEdit();
  const flow = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [toggleReset, setToggleReset] = useState(false);

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      controller.setSelected(nodes.map(node => Number(node.id)));
      console.log(nodes);
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
          data: { label: operation.alias },
          position: { x: operation.position_x, y: operation.position_y },
          type: operation.operation_type.toString()
        }))
      );
      setEdges(
        model.schema.arguments.map((argument, index) => ({
          id: String(index),
          source: String(argument.argument),
          target: String(argument.operation),
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
  }, [model.schema, setNodes, setEdges, setIsModified, toggleReset]);

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
    console.log(center);
    controller.promptCreateOperation(center.x, center.y, getPositions());
  }, [controller, getPositions, flow]);

  const handleDeleteOperation = useCallback(() => {
    if (controller.selected.length !== 1) {
      return;
    }
    controller.deleteOperation(controller.selected[0], getPositions());
  }, [controller, getPositions]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Hotkeys implementation
    if (controller.isProcessing) {
      return;
    }
    if (!controller.isMutable) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      handleDeleteOperation();
      return;
    }
  }

  const proOptions: ProOptions = useMemo(() => ({ hideAttribution: true }), []);
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
        fitView
        proOptions={proOptions}
        nodeTypes={OssNodeTypes}
        maxZoom={2}
        minZoom={0.75}
        nodesConnectable={false}
      />
    ),
    [nodes, edges, proOptions, handleNodesChange, onEdgesChange, OssNodeTypes]
  );

  return (
    <AnimateFade tabIndex={-1} onKeyDown={handleKeyDown}>
      <Overlay position='top-0 pt-1 right-1/2 translate-x-1/2' className='rounded-b-2xl cc-blur'>
        <ToolbarOssGraph
          isModified={isModified}
          onFitView={() => flow.fitView({ duration: PARAMETER.zoomDuration })}
          onCreate={handleCreateOperation}
          onDelete={handleDeleteOperation}
          onResetPositions={() => setToggleReset(prev => !prev)}
          onSavePositions={handleSavePositions}
        />
      </Overlay>
      <div className='relative' style={{ height: canvasHeight, width: canvasWidth }}>
        {graph}
      </div>
    </AnimateFade>
  );
}

export default OssFlow;
