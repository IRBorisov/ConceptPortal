'use client';

import { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  EdgeChange,
  NodeChange,
  NodeTypes,
  ProOptions,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useViewport
} from 'reactflow';

import Overlay from '@/components/ui/Overlay';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';

import { useOssEdit } from '../OssEditContext';
import InputNode from './InputNode';
import OperationNode from './OperationNode';
import ToolbarOssGraph from './ToolbarOssGraph';

function OssFlow() {
  const { calculateHeight } = useConceptOptions();
  const model = useOSS();
  const controller = useOssEdit();
  const viewport = useViewport();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useLayoutEffect(() => {
    if (!model.schema) {
      setNodes([]);
      setEdges([]);
      return;
    }
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
        target: String(argument.operation)
      }))
    );
  }, [model.schema, setNodes, setEdges]);

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
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleCreateOperation = useCallback(() => {
    // TODO: calculate insert location
    controller.promptCreateOperation(viewport.x, viewport.y, getPositions());
  }, [controller, viewport, getPositions]);

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
        onEdgesChange={handleEdgesChange}
        fitView
        proOptions={proOptions}
        nodeTypes={OssNodeTypes}
        maxZoom={2}
        minZoom={0.75}
      />
    ),
    [nodes, edges, proOptions, handleNodesChange, handleEdgesChange, OssNodeTypes]
  );

  return (
    <AnimateFade>
      <Overlay position='top-0 pt-1 right-1/2 translate-x-1/2' className='rounded-b-2xl cc-blur'>
        <ToolbarOssGraph onCreate={handleCreateOperation} />
      </Overlay>
      <div className='relative' style={{ height: canvasHeight, width: canvasWidth }}>
        {graph}
      </div>
    </AnimateFade>
  );
}

export default OssFlow;
