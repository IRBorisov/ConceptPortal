'use client';

import { useEffect, useRef } from 'react';
import { type Edge, MarkerType, type Node, useEdgesState, useNodesState, useOnSelectionChange } from 'reactflow';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { useMainHeight } from '@/stores/app-layout';
import { PARAMETER } from '@/utils/constants';
import { withPreventDefault } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { TGEdgeTypes } from '../../../components/term-graph/graph/tg-edge-types';
import { TGNodeTypes } from '../../../components/term-graph/graph/tg-node-types';
import { SelectColoring } from '../../../components/term-graph/select-coloring';
import { applyLayout, type TGNodeData } from '../../../models/graph-api';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { ToolbarTermGraph } from './toolbar-term-graph';
import { useFilteredGraph } from './use-filtered-graph';
import { ViewHidden } from './view-hidden';

export const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.3, duration: PARAMETER.zoomDuration },
  edgesFocusable: false,
  nodesFocusable: false,
  nodesConnectable: false,
  maxZoom: 3,
  minZoom: 0.25
} as const;

export function TGFlow() {
  const mainHeight = useMainHeight();
  const { fitView, viewportInitialized } = useReactFlow();
  const isProcessing = useMutatingRSForm();
  const { isContentEditable, schema, selected, setSelected, promptDeleteCst, focusCst, setFocus, navigateCst } =
    useRSEdit();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const filter = useTermGraphStore(state => state.filter);
  const { filteredGraph, hidden } = useFilteredGraph();

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));

    setSelected(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
  }
  useOnSelectionChange({
    onChange: onSelectionChange
  });

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

  const prevSelected = useRef<number[]>([]);
  if (
    viewportInitialized &&
    (prevSelected.current.length !== selected.length || prevSelected.current.some((id, i) => id !== selected[i]))
  ) {
    prevSelected.current = selected;
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: selected.includes(Number(node.id))
      }))
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      withPreventDefault(() => setFocus(null))(event);
      return;
    }
    if (!isContentEditable) {
      return;
    }
    if (event.key === 'Delete') {
      withPreventDefault(promptDeleteCst)(event);
      return;
    }
  }

  function handleNodeContextMenu(event: React.MouseEvent<Element>, node: TGNodeData) {
    event.preventDefault();
    event.stopPropagation();
    setFocus(focusCst?.id === node.data.cst.id ? null : node.data.cst);
  }

  function handleNodeDoubleClick(event: React.MouseEvent<Element>, node: TGNodeData) {
    event.preventDefault();
    event.stopPropagation();
    navigateCst(node.data.cst.id);
  }

  return (
    <div className='relative' tabIndex={-1} onKeyDown={handleKeyDown}>
      <ToolbarTermGraph className='cc-tab-tools' />

      <div className='absolute z-pop top-24 sm:top-16 left-2 sm:left-3 w-54 flex flex-col pointer-events-none'>
        <span className='px-2 pb-1 select-none whitespace-nowrap backdrop-blur-xs rounded-xl w-fit'>
          Выбор {selected.length} из {schema.stats?.count_all ?? 0}
        </span>
        <SelectColoring schema={schema} />
        <ViewHidden items={hidden} />
      </div>

      <DiagramFlow
        {...flowOptions}
        height={mainHeight}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={TGNodeTypes}
        edgeTypes={TGEdgeTypes}
        onContextMenu={event => event.preventDefault()}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
      />
    </div>
  );
}
