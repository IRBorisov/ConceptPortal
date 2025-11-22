'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useContinuousPan } from '@/components/flow/use-continuous-panning';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

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
import { useHandleActions } from './use-handle-actions';

const flowOptions = {
  fitView: true,
  fitViewOptions: { padding: 0.3, duration: PARAMETER.graphLayoutDuration },
  edgesFocusable: true,
  nodesFocusable: false,
  maxZoom: 3,
  minZoom: 0.25
} as const;

export function TGFlow() {
  const { isSmall } = useWindowSize();
  const mainHeight = useMainHeight();
  const { fitView, viewportInitialized } = useReactFlow();
  const [isAnimating, setIsAnimating] = useState(false);

  const flowRef = useRef<HTMLDivElement>(null);
  useContinuousPan(flowRef);

  const mode = useTermGraphStore(state => state.mode);

  const setConnectionStart = useTGConnectionStore(state => state.setStart);
  const connectionType = useTGConnectionStore(state => state.connectionType);

  const { createAttribution } = useCreateAttribution();
  const { updateConstituenta } = useUpdateConstituenta();

  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selectedCst,
    setSelectedCst,
    focusCst,
    setFocus,
    toggleSelectCst,
    navigateCst,
    selectedEdges,
    setSelectedEdges
  } = useRSEdit();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const filter = useTermGraphStore(state => state.filter);
  const { filteredGraph, hidden } = useFilteredGraph();
  const hiddenHeight = useFitHeight(isSmall ? '15rem + 2px' : '13.5rem + 2px', '4rem');
  const { handleKeyDown } = useHandleActions(filteredGraph);

  const suppressRFSelection = useRef<boolean>(false);
  function onSelectionChange({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
    if (suppressRFSelection.current) {
      return;
    }
    const selectedNodes = nodes.map(node => Number(node.id));
    const selectedEdges = edges.map(edge => edge.id);

    setSelectedCst(prev => {
      if (prev.length === selectedNodes.length && prev.every((id, i) => id === selectedNodes[i])) {
        return prev;
      }
      return [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...selectedNodes];
    });
    setSelectedEdges(prev => {
      if (prev.length === selectedEdges.length && prev.every((id, i) => id === selectedEdges[i])) {
        return prev;
      }
      return selectedEdges;
    });
  }
  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    return setConnectionStart(null);
  }, [setConnectionStart]);

  const prevNodesRef = useRef<Node[]>([]);
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

    const positionsChanged =
      prevNodesRef.current.some(prevNode => {
        const newNode = newNodes.find(n => n.id === prevNode.id);
        return !newNode || newNode.position.x !== prevNode.position.x || newNode.position.y !== prevNode.position.y;
      }) || newNodes.some(node => !prevNodesRef.current.find(prevNode => prevNode.id === node.id));

    if (!positionsChanged) {
      setNodes(prev =>
        newNodes.map(node => ({
          ...node,
          selected: prev.find(item => item.id === node.id)?.selected ?? false
        }))
      );
      setEdges(prev =>
        newEdges.map(edge => ({
          ...edge,
          selected: prev.find(item => item.id === edge.id)?.selected ?? false
        }))
      );
      return;
    }

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

    prevNodesRef.current = newNodes;

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
    fitView,
    viewportInitialized,
    focusCst,
    filter.graphType
  ]);

  useEffect(() => {
    setTimeout(() => fitView(flowOptions.fitViewOptions), PARAMETER.refreshTimeout);
  }, [schema.id, filter.noText, filter.graphType, focusCst, fitView]);

  const readyForUpdate = nodes.length === filteredGraph.nodes.size;
  const prevSelectedNodes = useRef<number[]>([]);
  useEffect(() => {
    if (!viewportInitialized || !readyForUpdate) {
      return;
    }
    const hasChanged =
      prevSelectedNodes.current.length !== selectedCst.length ||
      prevSelectedNodes.current.some((id, i) => id !== selectedCst[i]);
    if (!hasChanged) {
      return;
    }

    suppressRFSelection.current = true;

    prevSelectedNodes.current = selectedCst;
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: selectedCst.includes(Number(node.id))
      }))
    );

    const frame = requestAnimationFrame(() => {
      suppressRFSelection.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [viewportInitialized, selectedCst, setNodes, readyForUpdate]);

  const prevSelectedEdges = useRef<string[]>([]);
  useEffect(() => {
    if (!viewportInitialized || !readyForUpdate) {
      return;
    }
    const hasChanged =
      prevSelectedEdges.current.length !== selectedEdges.length ||
      prevSelectedEdges.current.some((id, i) => id !== selectedEdges[i]);
    if (!hasChanged) {
      return;
    }

    suppressRFSelection.current = true;

    prevSelectedEdges.current = selectedEdges;
    setEdges(prev =>
      prev.map(edge => ({
        ...edge,
        selected: selectedEdges.includes(edge.id)
      }))
    );

    const frame = requestAnimationFrame(() => {
      suppressRFSelection.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedEdges, setEdges, readyForUpdate, viewportInitialized]);

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
    const sourceCst = schema.cstByID.get(sourceID);
    const targetCst = schema.cstByID.get(targetID);
    if (!targetCst || !sourceCst) {
      throw new Error('Constituents not found');
    }

    if (connectionType === TGEdgeType.definition) {
      if (targetCst.is_inherited) {
        toast.error(errorMsg.changeInheritedDefinition);
        return;
      }
      if (schema.graph.hasEdge(sourceID, targetID)) {
        toast.error(errorMsg.connectionExists);
        return;
      }
      if (schema.graph.isReachable(targetID, sourceID)) {
        toast.error(errorMsg.cyclingEdge);
        return;
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
    } else {
      if (schema.attribution_graph.hasEdge(sourceID, targetID)) {
        toast.error(errorMsg.connectionExists);
        return;
      }
      if (schema.attribution_graph.isReachable(targetID, sourceID)) {
        toast.error(errorMsg.cyclingEdge);
        return;
      }
      if (targetCst.parent_schema !== null && targetCst.parent_schema === sourceCst.parent_schema) {
        toast.error(errorMsg.addInheritedEdge);
        return;
      }

      void createAttribution({
        itemID: schema.id,
        data: {
          container: sourceID,
          attribute: targetID
        }
      });
    }
  }

  return (
    <div
      ref={flowRef}
      className={clsx(
        'relative',
        mode === InteractionMode.explore ? 'mode-explore' : 'mode-edit',
        isAnimating && 'rf-animation'
      )}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <ToolbarTermGraph className='cc-tab-tools' graph={filteredGraph} />

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
