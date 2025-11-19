'use client';

import { useEffect, useRef, useState } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState } from 'reactflow';
import clsx from 'clsx';

import { type IConstituenta, type IRSForm } from '@/features/rsform';
import { colorGraphEdge } from '@/features/rsform/colors';
import { FocusLabel } from '@/features/rsform/components/term-graph/focus-label';
import { TGEdgeTypes } from '@/features/rsform/components/term-graph/graph/tg-edge-types';
import { TGNodeTypes } from '@/features/rsform/components/term-graph/graph/tg-node-types';
import { SelectColoring } from '@/features/rsform/components/term-graph/select-coloring';
import { SelectEdgeType } from '@/features/rsform/components/term-graph/select-edge-type';
import { ToolbarFocusedCst } from '@/features/rsform/components/term-graph/toolbar-focused-cst';
import { ViewHidden } from '@/features/rsform/components/term-graph/view-hidden';
import { applyLayout, inferEdgeType, produceFilteredGraph, type TGNodeData } from '@/features/rsform/models/graph-api';
import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { useContinuousPan } from '@/components/flow/use-continuous-panning';
import { useFitHeight } from '@/stores/app-layout';
import { PARAMETER } from '@/utils/constants';

import ToolbarGraphFilter from './toolbar-graph-filter';

export const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.3, duration: PARAMETER.zoomDuration },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 3,
  minZoom: 0.25
} as const;

export interface TGReadonlyFlowProps {
  schema: IRSForm;
}

export function TGReadonlyFlow({ schema }: TGReadonlyFlowProps) {
  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useContinuousPan(flowRef);

  const filter = useTermGraphStore(state => state.filter);
  const filteredGraph = produceFilteredGraph(schema, filter, focusCst);
  const hidden = schema.items.filter(cst => !filteredGraph.hasNode(cst.id)).map(cst => cst.id);
  const hiddenHeight = useFitHeight('15.5rem + 2px', '4rem');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const { fitView, viewportInitialized } = useReactFlow();

  useEffect(() => {
    if (!viewportInitialized) {
      return;
    }
    const nodeIDs = Array.from(filteredGraph.nodes.keys());
    const newNodes: Node[] = nodeIDs.map(nodeID => {
      const cst = schema.cstByID.get(nodeID);
      if (!cst) {
        throw new Error(`Node not found ${nodeID}`);
      }
      return {
        id: String(nodeID),
        type: 'concept',
        position: { x: 0, y: 0 },
        data: { cst: cst, focused: focusCst?.id === cst.id }
      };
    });

    const newEdges: Edge[] = [];
    filteredGraph.nodes.forEach(source => {
      source.outputs.forEach(target => {
        const edgeType = inferEdgeType(schema, source.id, target);
        const color = filter.graphType === 'full' ? colorGraphEdge(edgeType) : colorGraphEdge(filter.graphType);
        newEdges.push({
          id: String(newEdges.length + 1),
          source: String(source.id),
          target: String(target),
          type: 'termEdge',
          style: { stroke: color },
          focusable: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: color
          }
        });
      });
    });

    applyLayout(newNodes, newEdges, !filter.noText);

    const startAnimationFrame = requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    const stateChangeTimeout = setTimeout(() => {
      setNodes(prev =>
        !prev
          ? newNodes
          : newNodes.map(node => ({ ...node, selected: prev.find(item => item.id === node.id)?.selected ?? false }))
      );
      setEdges(prev =>
        !prev
          ? newEdges
          : newEdges.map(edge => ({ ...edge, selected: prev.find(item => item.id === edge.id)?.selected ?? false }))
      );
    }, PARAMETER.minimalTimeout);

    const animationStopTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, PARAMETER.graphLayoutDuration);

    return () => {
      cancelAnimationFrame(startAnimationFrame);
      clearTimeout(animationStopTimeout);
      clearTimeout(stateChangeTimeout);
    };
  }, [
    schema,
    filteredGraph,
    setNodes,
    setEdges,
    filter.noText,
    filter.graphType,
    fitView,
    viewportInitialized,
    focusCst
  ]);

  useEffect(() => {
    setTimeout(
      () => fitView({ ...flowOptions.fitViewOptions, duration: PARAMETER.graphLayoutDuration }),
      4 * PARAMETER.minimalTimeout
    );
  }, [schema.id, filter.noText, filter.graphType, focusCst, fitView]);

  function handleNodeContextMenu(event: React.MouseEvent<Element>, node: TGNodeData) {
    event.preventDefault();
    event.stopPropagation();
    setFocusCst(focusCst?.id === node.data.cst.id ? null : node.data.cst);
  }

  return (
    <div ref={flowRef} className={clsx('relative w-full h-full flex flex-col', isAnimating && 'rf-animation')}>
      <div className='cc-tab-tools mt-2 flex flex-col items-center  rounded-b-2xl backdrop-blur-xs'>
        <ToolbarGraphFilter />
        {focusCst ? <ToolbarFocusedCst resetFocus={() => setFocusCst(null)} /> : null}
        {focusCst ? <FocusLabel label={focusCst.alias} /> : null}
      </div>
      <div className='absolute z-pop top-24 sm:top-16 left-2 sm:left-3 w-54 flex flex-col pointer-events-none'>
        <SelectColoring className='rounded-b-none' schema={schema} />
        <SelectEdgeType className='rounded-none border-t-0' />
        <ViewHidden items={hidden} listHeight={hiddenHeight} schema={schema} setFocus={setFocusCst} />
      </div>

      <DiagramFlow
        {...flowOptions}
        height='100%'
        className='cc-mask-sides w-full h-full'
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={TGNodeTypes}
        edgeTypes={TGEdgeTypes}
        onContextMenu={event => event.preventDefault()}
        onNodeContextMenu={handleNodeContextMenu}
      />
    </div>
  );
}
