'use client';

import { useEffect } from 'react';
import {
  type Edge,
  MarkerType,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow,
  useStoreApi
} from 'reactflow';
import clsx from 'clsx';

import { useMainHeight } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { ToolbarGraphSelection } from '../../../components/ToolbarGraphSelection';
import { type IConstituenta } from '../../../models/rsform';
import { isBasicConcept } from '../../../models/rsformAPI';
import { useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

import { TGEdgeTypes } from './graph/TGEdgeTypes';
import { applyLayout } from './graph/TGLayout';
import { TGNodeTypes } from './graph/TGNodeTypes';
import { GraphSelectors } from './GraphSelectors';
import { ToolbarFocusedCst } from './ToolbarFocusedCst';
import { ToolbarTermGraph } from './ToolbarTermGraph';
import { useFilteredGraph } from './useFilteredGraph';
import { ViewHidden } from './ViewHidden';

export const ZOOM_MAX = 3;
export const ZOOM_MIN = 0.25;
export const VIEW_PADDING = 0.3;

export function TGFlow() {
  const mainHeight = useMainHeight();
  const { fitView, viewportInitialized } = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();
  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selected,
    setSelected,
    canDeleteSelected,
    promptDeleteCst,
    focusCst,
    setFocus,
    deselectAll
  } = useRSEdit();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const filter = useTermGraphStore(state => state.filter);
  const { filteredGraph, hidden } = useFilteredGraph();

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));
    if (ids.length === 0) {
      deselectAll();
    } else {
      setSelected(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
    }
  }
  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    if (!viewportInitialized) {
      return;
    }
    const newNodes: Node<IConstituenta>[] = [];
    filteredGraph.nodes.forEach(node => {
      const cst = schema.cstByID.get(node.id);
      if (cst) {
        newNodes.push({
          id: String(node.id),
          type: 'concept',
          position: { x: 0, y: 0 },
          data: cst
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

    setTimeout(() => {
      fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING });
    }, PARAMETER.minimalTimeout);
  }, [schema, filteredGraph, setNodes, setEdges, filter.noText, fitView, viewportInitialized, focusCst]);

  useEffect(() => {
    if (!viewportInitialized) {
      return;
    }
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: selected.includes(Number(node.id))
      }))
    );
  }, [selected, setNodes, viewportInitialized]);

  function handleSetSelected(newSelection: number[]) {
    setSelected(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setFocus(null);
      return;
    }
    if (!isContentEditable) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      if (canDeleteSelected) {
        promptDeleteCst();
      }
      return;
    }
  }

  return (
    <div className='cc-fade-in relative' tabIndex={-1} onKeyDown={handleKeyDown}>
      <div className='cc-tab-tools flex flex-col items-center rounded-b-2xl cc-blur'>
        <ToolbarTermGraph />
        <ToolbarFocusedCst />
        {!focusCst ? (
          <ToolbarGraphSelection
            graph={schema.graph}
            isCore={cstID => {
              const cst = schema.cstByID.get(cstID);
              return !!cst && isBasicConcept(cst.cst_type);
            }}
            isOwned={schema.inheritance.length > 0 ? cstID => !schema.cstByID.get(cstID)?.is_inherited : undefined}
            value={selected}
            onChange={handleSetSelected}
          />
        ) : null}
      </div>

      <div
        className={clsx(
          'absolute z-pop top-[4.4rem] sm:top-[4.1rem] left-[0.5rem] sm:left-[0.65rem] w-[13.5rem]',
          'flex flex-col pointer-events-none'
        )}
      >
        <div className='px-2 pb-1 select-none whitespace-nowrap cc-blur rounded-xl'>
          Выбор {selected.length} из {schema.stats?.count_all ?? 0}
        </div>
        <GraphSelectors />
        <ViewHidden items={hidden} />
      </div>

      <div className='relative outline-hidden w-[100dvw]' style={{ height: mainHeight }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          fitView
          edgesFocusable={false}
          nodesFocusable={false}
          nodesConnectable={false}
          nodeTypes={TGNodeTypes}
          edgeTypes={TGEdgeTypes}
          maxZoom={ZOOM_MAX}
          minZoom={ZOOM_MIN}
          onContextMenu={event => event.preventDefault()}
        />
      </div>
    </div>
  );
}
