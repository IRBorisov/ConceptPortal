'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  type Connection,
  type Edge,
  MarkerType,
  type Node,
  type OnConnectStartParams,
  useEdgesState,
  useNodesState,
  useOnSelectionChange
} from 'reactflow';
import clsx from 'clsx';

import { DiagramFlow, useReactFlow } from '@/components/flow/diagram-flow';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { ParsingStatus } from '../../../backend/types';
import { useCreateAttribution } from '../../../backend/use-create-attribution';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useUpdateConstituenta } from '../../../backend/use-update-constituenta';
import { colorGraphEdge } from '../../../colors';
import { TGConnectionLine } from '../../../components/term-graph/graph/tg-connection';
import { TGEdgeTypes } from '../../../components/term-graph/graph/tg-edge-types';
import { TGNodeTypes } from '../../../components/term-graph/graph/tg-node-types';
import { SelectColoring } from '../../../components/term-graph/select-coloring';
import { SelectEdgeType } from '../../../components/term-graph/select-edge-type';
import { ViewHidden } from '../../../components/term-graph/view-hidden';
import { applyLayout, inferEdgeType, type TGNodeData } from '../../../models/graph-api';
import { addAliasReference } from '../../../models/rsform-api';
import { InteractionMode, TGEdgeType, useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { ToolbarTermGraph } from './toolbar-term-graph';
import { useFilteredGraph } from './use-filtered-graph';

export const fitViewOptions = { padding: 0.3, duration: PARAMETER.zoomDuration };

const flowOptions = {
  fitView: true,
  fitViewOptions: fitViewOptions,
  edgesFocusable: true,
  nodesFocusable: false,
  maxZoom: 3,
  minZoom: 0.25
} as const;

export function TGFlow() {
  const { isSmall } = useWindowSize();
  const mainHeight = useMainHeight();
  const { fitView, viewportInitialized } = useReactFlow();

  const mode = useTermGraphStore(state => state.mode);
  const toggleMode = useTermGraphStore(state => state.toggleMode);
  const toggleEdgeType = useTGConnectionStore(state => state.toggleConnectionType);
  const setConnectionStart = useTGConnectionStore(state => state.setStart);
  const connectionType = useTGConnectionStore(state => state.connectionType);
  const toggleText = useTermGraphStore(state => state.toggleText);

  const { createAttribution } = useCreateAttribution();
  const { updateConstituenta } = useUpdateConstituenta();

  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selectedCst,
    setSelectedCst,
    promptDeleteSelected,
    focusCst,
    setFocus,
    toggleSelectCst,
    navigateCst,
    selectedEdges,
    setSelectedEdges,
    deselectAll
  } = useRSEdit();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const filter = useTermGraphStore(state => state.filter);
  const { filteredGraph, hidden } = useFilteredGraph();
  const hiddenHeight = useFitHeight(isSmall ? '15rem + 2px' : '13.5rem + 2px', '4rem');

  function onSelectionChange({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
    if (mode === InteractionMode.explore) {
      const ids = nodes.map(node => Number(node.id));
      setSelectedCst(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
      setSelectedEdges([]);
    } else {
      setSelectedCst([]);
      setSelectedEdges(edges.map(edge => edge.id));
    }
  }
  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    return setConnectionStart(null);
  }, [setConnectionStart]);

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
        const target_cst = schema.cstByID.get(target)!;
        const color =
          filter.graphType === TGEdgeType.full ? colorGraphEdge(edgeType) : colorGraphEdge(filter.graphType);
        const dashes =
          edgeType === TGEdgeType.definition && target_cst.parse?.status !== ParsingStatus.VERIFIED ? '6 4' : '';
        newEdges.push({
          id: `${source.id}-${target}`,
          source: String(source.id),
          target: String(target),
          type: 'termEdge',
          style: { stroke: color, strokeDasharray: dashes },
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
    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    schema,
    filteredGraph,
    setNodes,
    setEdges,
    filter.noText,
    fitView,
    viewportInitialized,
    focusCst,
    filter.graphType
  ]);

  useEffect(() => {
    setTimeout(() => fitView(flowOptions.fitViewOptions), PARAMETER.minimalTimeout);
  }, [schema.id, filter.noText, filter.graphType, focusCst, fitView]);

  const prevSelectedNodes = useRef<number[]>([]);
  useEffect(() => {
    if (!viewportInitialized) {
      return;
    }
    const hasChanged =
      prevSelectedNodes.current.length !== selectedCst.length ||
      prevSelectedNodes.current.some((id, i) => id !== selectedCst[i]);
    if (!hasChanged) {
      return;
    }

    prevSelectedNodes.current = selectedCst;
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: selectedCst.includes(Number(node.id))
      }))
    );
  }, [viewportInitialized, selectedCst, setNodes]);

  const prevSelectedEdges = useRef<string[]>([]);
  useEffect(() => {
    const hasChanged =
      prevSelectedEdges.current.length !== selectedEdges.length ||
      prevSelectedEdges.current.some((id, i) => id !== selectedEdges[i]);
    if (!hasChanged) {
      return;
    }

    prevSelectedEdges.current = selectedEdges;
    setEdges(prev =>
      prev.map(edge => ({
        ...edge,
        selected: selectedEdges.includes(edge.id)
      }))
    );
  }, [selectedEdges, setEdges]);

  function handleDeleteSelected() {
    if (isProcessing) {
      return;
    }
    promptDeleteSelected();
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

  function handleConnectStart(
    event: React.MouseEvent<Element> | React.TouchEvent<Element>,
    params: OnConnectStartParams
  ) {
    event.preventDefault();
    event.stopPropagation();
    setConnectionStart(params.nodeId);
  }

  function handleConnectEnd(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    setConnectionStart(null);
  }

  function handleConnect(connection: Connection) {
    if (!isContentEditable || isProcessing) {
      return;
    }
    if (!connection.source || !connection.target || connection.source === connection.target) {
      return;
    }

    const sourceID = Number(connection.source);
    const targetID = Number(connection.target);
    if (
      (connectionType === TGEdgeType.attribution && schema.attribution_graph.hasEdge(sourceID, targetID)) ||
      (connectionType === TGEdgeType.definition && schema.graph.hasEdge(sourceID, targetID))
    ) {
      toast.info(errorMsg.connectionExists);
      return;
    }

    if (connectionType === TGEdgeType.definition) {
      const sourceCst = schema.cstByID.get(sourceID);
      const targetCst = schema.cstByID.get(targetID);
      if (!targetCst || !sourceCst) {
        throw new Error('Constituents not found');
      }
      const newExpressions = addAliasReference(targetCst.definition_formal, sourceCst.alias);
      void updateConstituenta({
        itemID: schema.id,
        data: {
          target: targetID,
          item_data: {
            definition_formal: newExpressions
          }
        }
      });
      return;
    } else {
      void createAttribution({
        itemID: schema.id,
        data: {
          container: sourceID,
          attribute: targetID
        }
      });
    }
  }

  function handleToggleMode() {
    toggleMode();
    deselectAll();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.code === 'Escape') {
      withPreventDefault(() => setFocus(null))(event);
      return;
    }
    if (event.code === 'KeyG') {
      withPreventDefault(() => fitView(flowOptions.fitViewOptions))(event);
      return;
    }
    if (event.code === 'KeyT') {
      withPreventDefault(toggleText)(event);
      return;
    }

    if (isContentEditable && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.code === 'KeyQ') {
        withPreventDefault(handleToggleMode)(event);
        return;
      }
      if (event.code === 'KeyE' && mode === InteractionMode.edit) {
        withPreventDefault(toggleEdgeType)(event);
        return;
      }
      if (event.code === 'Delete') {
        withPreventDefault(handleDeleteSelected)(event);
        return;
      }
    }
  }

  return (
    <div
      className={clsx('relative', mode === InteractionMode.explore ? 'mode-explore' : 'mode-edit')}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <ToolbarTermGraph className='cc-tab-tools' onDeleteSelected={handleDeleteSelected} />

      <div className='absolute z-pop top-24 sm:top-16 left-2 sm:left-3 w-54 flex flex-col pointer-events-none'>
        <span className='px-2 pb-1 select-none whitespace-nowrap backdrop-blur-xs rounded-xl w-fit'>
          Выбор {selectedCst.length} из {schema.stats?.count_all ?? 0}
        </span>

        <SelectColoring className='rounded-b-none' schema={schema} />
        <SelectEdgeType className='rounded-none border-t-0' />

        <ViewHidden
          items={hidden}
          listHeight={hiddenHeight}
          schema={schema}
          selected={selectedCst}
          toggleSelect={toggleSelectCst}
          setFocus={setFocus}
          onActivate={navigateCst}
        />
      </div>

      <DiagramFlow
        {...flowOptions}
        height={mainHeight}
        nodes={nodes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        edges={edges}
        nodeTypes={TGNodeTypes}
        edgeTypes={TGEdgeTypes}
        onContextMenu={event => event.preventDefault()}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodesConnectable={mode === InteractionMode.edit}
        connectionLineComponent={TGConnectionLine}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onConnect={handleConnect}
      />
    </div>
  );
}
