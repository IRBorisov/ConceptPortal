'use client';

import { useCallback, useEffect, useState } from 'react';
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

import { Overlay } from '@/components/Container';
import { useMainHeight } from '@/stores/appLayout';
import { useTooltipsStore } from '@/stores/tooltips';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { colorBgGraphNode } from '../../../colors';
import { ToolbarGraphSelection } from '../../../components/ToolbarGraphSelection';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { isBasicConcept } from '../../../models/rsformAPI';
import { type GraphFilterParams, useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

import { TGEdgeTypes } from './graph/TGEdgeTypes';
import { applyLayout } from './graph/TGLayout';
import { type TGNodeData } from './graph/TGNode';
import { TGNodeTypes } from './graph/TGNodeTypes';
import { GraphSelectors } from './GraphSelectors';
import { SelectedCounter } from './SelectedCounter';
import { ToolbarFocusedCst } from './ToolbarFocusedCst';
import { ToolbarTermGraph } from './ToolbarTermGraph';
import { ViewHidden } from './ViewHidden';

export const ZOOM_MAX = 3;
export const ZOOM_MIN = 0.25;

export function TGFlow() {
  const mainHeight = useMainHeight();
  const flow = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();
  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selected,
    setSelected,
    navigateCst,
    toggleSelect,
    canDeleteSelected,
    promptDeleteCst
  } = useRSEdit();

  const filter = useTermGraphStore(state => state.filter);
  const coloring = useTermGraphStore(state => state.coloring);
  const setColoring = useTermGraphStore(state => state.setColoring);

  const setActiveCst = useTooltipsStore(state => state.setActiveCst);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);
  const filteredGraph = produceFilteredGraph(schema, filter, focusCst);
  const [hidden, setHidden] = useState<number[]>([]);

  const [needReset, setNeedReset] = useState(true);

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));
    if (ids.length === 0) {
      setSelected([]);
    } else {
      setSelected(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
    }
  }

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    const newDismissed: number[] = [];
    schema.items.forEach(cst => {
      if (!filteredGraph.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setHidden(newDismissed);
  }, [schema, filteredGraph]);

  const resetNodes = useCallback(() => {
    const newNodes: Node<TGNodeData>[] = [];
    filteredGraph.nodes.forEach(node => {
      const cst = schema.cstByID.get(node.id);
      if (cst) {
        newNodes.push({
          id: String(node.id),
          type: 'concept',
          selected: selected.includes(node.id),
          position: { x: 0, y: 0 },
          data: {
            fill: focusCst === cst ? APP_COLORS.bgPurple : colorBgGraphNode(cst, coloring),
            label: cst.alias,
            description: !filter.noText ? cst.term_resolved : ''
          }
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
  }, [schema, filteredGraph, setNodes, setEdges, filter.noText, selected, focusCst, coloring]);

  useEffect(() => {
    setNeedReset(true);
  }, [schema, focusCst, coloring, filter]);

  useEffect(() => {
    if (!needReset || !flow.viewportInitialized) {
      return;
    }
    setNeedReset(false);
    resetNodes();
  }, [needReset, schema, resetNodes, flow.viewportInitialized]);

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
      handleSetFocus(null);
      handleSetSelected([]);
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

  function handleSetFocus(cstID: number | null) {
    if (cstID === null) {
      setFocusCst(null);
    } else {
      const target = schema.cstByID.get(cstID) ?? null;
      setFocusCst(prev => (prev === target ? null : target));
    }
    setSelected([]);
    setTimeout(() => {
      flow.fitView({ duration: PARAMETER.zoomDuration });
    }, PARAMETER.minimalTimeout);
  }

  function handleNodeContextMenu(event: React.MouseEvent, cstID: number) {
    event.preventDefault();
    event.stopPropagation();
    handleSetFocus(cstID);
  }

  function handleNodeDoubleClick(event: React.MouseEvent, cstID: number) {
    event.preventDefault();
    event.stopPropagation();
    navigateCst(cstID);
  }

  function handleNodeEnter(cstID: number) {
    const cst = schema.cstByID.get(cstID);
    if (cst) {
      setActiveCst(cst);
    }
  }

  return (
    <>
      <Overlay position='cc-tab-tools' className='flex flex-col items-center rounded-b-2xl cc-blur'>
        <ToolbarTermGraph />
        {focusCst ? <ToolbarFocusedCst focusedCst={focusCst} onResetFocus={() => handleSetFocus(null)} /> : null}
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
      </Overlay>

      <div className='cc-fade-in' tabIndex={-1} onKeyDown={handleKeyDown}>
        <SelectedCounter
          totalCount={schema.stats?.count_all ?? 0}
          selectedCount={selected.length}
          position='top-[4.4rem] sm:top-[4.1rem] left-[0.5rem] sm:left-[0.65rem]'
        />

        <Overlay position='top-[6.15rem] sm:top-[5.9rem] left-0' className='flex gap-1 pointer-events-none'>
          <div className='flex flex-col ml-2 w-[13.5rem]'>
            <GraphSelectors schema={schema} coloring={coloring} onChangeColoring={setColoring} />
            <ViewHidden
              items={hidden}
              selected={selected}
              schema={schema}
              coloringScheme={coloring}
              toggleSelection={toggleSelect}
              setFocus={handleSetFocus}
            />
          </div>
        </Overlay>

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
            onNodeMouseEnter={(_, node) => handleNodeEnter(Number(node.id))}
            onNodeDoubleClick={(event, node) => handleNodeDoubleClick(event, Number(node.id))}
            onNodeContextMenu={(event, node) => handleNodeContextMenu(event, Number(node.id))}
          />
        </div>
      </div>
    </>
  );
}

// ====== Internals =========
function produceFilteredGraph(schema: IRSForm, params: GraphFilterParams, focusCst: IConstituenta | null) {
  const filtered = schema.graph.clone();
  const allowedTypes: CstType[] = (() => {
    const result: CstType[] = [];
    if (params.allowBase) result.push(CstType.BASE);
    if (params.allowStruct) result.push(CstType.STRUCTURED);
    if (params.allowTerm) result.push(CstType.TERM);
    if (params.allowAxiom) result.push(CstType.AXIOM);
    if (params.allowFunction) result.push(CstType.FUNCTION);
    if (params.allowPredicate) result.push(CstType.PREDICATE);
    if (params.allowConstant) result.push(CstType.CONSTANT);
    if (params.allowTheorem) result.push(CstType.THEOREM);
    return result;
  })();

  if (params.noHermits) {
    filtered.removeIsolated();
  }
  if (params.noTemplates) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && cst.is_template) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (allowedTypes.length < Object.values(CstType).length) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (!focusCst && params.foldDerived) {
    schema.items.forEach(cst => {
      if (cst.spawner) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (focusCst) {
    const includes: number[] = [
      focusCst.id,
      ...focusCst.spawn,
      ...(params.focusShowInputs ? schema.graph.expandInputs([focusCst.id]) : []),
      ...(params.focusShowOutputs ? schema.graph.expandOutputs([focusCst.id]) : [])
    ];
    schema.items.forEach(cst => {
      if (!includes.includes(cst.id)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (params.noTransitive) {
    filtered.transitiveReduction();
  }

  return filtered;
}
