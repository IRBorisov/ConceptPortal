'use client';

import { useEffect, useState } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState } from 'reactflow';

import { type IConstituenta, type IRSForm } from '@/features/rsform';
import { TGEdgeTypes } from '@/features/rsform/components/term-graph/graph/tg-edge-types';
import { TGNodeTypes } from '@/features/rsform/components/term-graph/graph/tg-node-types';
import { SelectColoring } from '@/features/rsform/components/term-graph/select-coloring';
import { SelectGraphType } from '@/features/rsform/components/term-graph/select-graph-type';
import { ToolbarFocusedCst } from '@/features/rsform/components/term-graph/toolbar-focused-cst';
import { ViewHidden } from '@/features/rsform/components/term-graph/view-hidden';
import { applyLayout, produceFilteredGraph, type TGNodeData } from '@/features/rsform/models/graph-api';
import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
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
    const newNodes: Node[] = [];
    filteredGraph.nodes.forEach(node => {
      const cst = schema.cstByID.get(node.id);
      if (cst) {
        newNodes.push({
          id: String(node.id),
          type: 'concept',
          position: { x: 0, y: 0 },
          data: { cst: cst, focused: focusCst?.id === cst.id }
        });
      }
    });

    const newEdges: Edge[] = [];
    let edgeID = 1;
    filteredGraph.nodes.forEach(source => {
      source.outputs.forEach(target => {
        if (newNodes.find(node => node.id === String(target))) {
          newEdges.push({
            id: String(edgeID),
            source: String(source.id),
            target: String(target),
            type: 'termEdge',
            focusable: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20
            }
          });
          edgeID += 1;
        }
      });
    });

    applyLayout(newNodes, newEdges, !filter.noText);

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => fitView(flowOptions.fitViewOptions), PARAMETER.minimalTimeout);
  }, [schema, filteredGraph, setNodes, setEdges, filter.noText, fitView, viewportInitialized, focusCst]);

  function handleNodeContextMenu(event: React.MouseEvent<Element>, node: TGNodeData) {
    event.preventDefault();
    event.stopPropagation();
    setFocusCst(focusCst?.id === node.data.cst.id ? null : node.data.cst);
  }

  return (
    <div className='relative w-full h-full flex flex-col'>
      <div className='cc-tab-tools flex mt-2 items-start rounded-b-2xl backdrop-blur-xs'>
        {focusCst ? <ToolbarFocusedCst focus={focusCst} resetFocus={() => setFocusCst(null)} /> : null}
        <ToolbarGraphFilter />
      </div>
      <div className='absolute z-pop top-24 sm:top-16 left-2 sm:left-3 w-54 flex flex-col pointer-events-none'>
        <SelectColoring className='rounded-b-none' schema={schema} />
        <SelectGraphType className='rounded-none border-t-0' />
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
