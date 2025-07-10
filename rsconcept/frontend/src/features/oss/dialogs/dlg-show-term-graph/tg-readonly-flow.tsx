'use client';

import { useEffect, useState } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState } from 'reactflow';

import { TGEdgeTypes } from '@/features/rsform/components/term-graph/graph/tg-edge-types';
import { TGNodeTypes } from '@/features/rsform/components/term-graph/graph/tg-node-types';
import { SelectColoring } from '@/features/rsform/components/term-graph/select-coloring';
import { ToolbarFocusedCst } from '@/features/rsform/components/term-graph/toolbar-focused-cst';
import { applyLayout, produceFilteredGraph, type TGNodeData } from '@/features/rsform/models/graph-api';
import { type IConstituenta, type IRSForm } from '@/features/rsform/models/rsform';
import { flowOptions } from '@/features/rsform/pages/rsform-page/editor-term-graph/tg-flow';
import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { PARAMETER } from '@/utils/constants';

import ToolbarGraphFilter from './toolbar-graph-filter';

export interface TGReadonlyFlowProps {
  schema: IRSForm;
}

export function TGReadonlyFlow({ schema }: TGReadonlyFlowProps) {
  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);

  const filter = useTermGraphStore(state => state.filter);
  const filteredGraph = produceFilteredGraph(schema, filter, focusCst);

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
      <div className='cc-tab-tools flex flex-col mt-2 items-center rounded-b-2xl backdrop-blur-xs'>
        <ToolbarGraphFilter />
        <ToolbarFocusedCst className='-translate-x-9' focus={focusCst} resetFocus={() => setFocusCst(null)} />
      </div>
      <div className='absolute z-pop top-24 sm:top-16 left-2 sm:left-3 w-54 flex flex-col pointer-events-none'>
        <SelectColoring schema={schema} />
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
