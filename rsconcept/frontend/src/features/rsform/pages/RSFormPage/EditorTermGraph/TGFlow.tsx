'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Edge,
  getNodesBounds,
  getViewportForBounds,
  MarkerType,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow,
  useStoreApi
} from 'reactflow';
import clsx from 'clsx';
import { toPng } from 'html-to-image';
import { useDebounce } from 'use-debounce';

import { Overlay } from '@/components/Container';
import { CProps } from '@/components/props';
import { useMainHeight } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { colorBgGraphNode } from '../../../colors';
import InfoConstituenta from '../../../components/InfoConstituenta';
import ToolbarGraphSelection from '../../../components/ToolbarGraphSelection';
import { IConstituenta, IRSForm } from '../../../models/rsform';
import { isBasicConcept } from '../../../models/rsformAPI';
import { GraphFilterParams, useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

import { TGEdgeTypes } from './graph/TGEdgeTypes';
import { applyLayout } from './graph/TGLayout';
import { TGNodeData } from './graph/TGNode';
import { TGNodeTypes } from './graph/TGNodeTypes';
import GraphSelectors from './GraphSelectors';
import SelectedCounter from './SelectedCounter';
import ToolbarFocusedCst from './ToolbarFocusedCst';
import ToolbarTermGraph from './ToolbarTermGraph';
import ViewHidden from './ViewHidden';

const ZOOM_MAX = 3;
const ZOOM_MIN = 0.25;

function TGFlow() {
  const mainHeight = useMainHeight();
  const controller = useRSEdit();
  const flow = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();
  const isProcessing = useMutatingRSForm();

  const showParams = useDialogsStore(state => state.showGraphParams);

  const filter = useTermGraphStore(state => state.filter);
  const setFilter = useTermGraphStore(state => state.setFilter);
  const coloring = useTermGraphStore(state => state.coloring);
  const setColoring = useTermGraphStore(state => state.setColoring);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);
  const filteredGraph = produceFilteredGraph(controller.schema, filter, focusCst);
  const [hidden, setHidden] = useState<number[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverID, setHoverID] = useState<number | null>(null);
  const hoverCst = hoverID && controller.schema.cstByID.get(hoverID);
  const [hoverCstDebounced] = useDebounce(hoverCst, PARAMETER.graphPopupDelay);
  const [hoverLeft, setHoverLeft] = useState(true);

  const [needReset, setNeedReset] = useState(true);
  const [toggleResetView, setToggleResetView] = useState(false);

  function onSelectionChange({ nodes }: { nodes: Node[] }) {
    const ids = nodes.map(node => Number(node.id));
    if (ids.length === 0) {
      controller.setSelected([]);
    } else {
      controller.setSelected(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
    }
  }

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    const newDismissed: number[] = [];
    controller.schema.items.forEach(cst => {
      if (!filteredGraph.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setHidden(newDismissed);
    setHoverID(null);
  }, [controller.schema, filteredGraph]);

  const resetNodes = useCallback(() => {
    const newNodes: Node<TGNodeData>[] = [];
    filteredGraph.nodes.forEach(node => {
      const cst = controller.schema.cstByID.get(node.id);
      if (cst) {
        newNodes.push({
          id: String(node.id),
          type: 'concept',
          selected: controller.selected.includes(node.id),
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
  }, [controller.schema, filteredGraph, setNodes, setEdges, filter.noText, controller.selected, focusCst, coloring]);

  useEffect(() => {
    setNeedReset(true);
  }, [controller.schema, focusCst, coloring, filter]);

  useEffect(() => {
    if (!needReset || !flow.viewportInitialized) {
      return;
    }
    setNeedReset(false);
    resetNodes();
  }, [needReset, controller.schema, resetNodes, flow.viewportInitialized]);

  useEffect(() => {
    setTimeout(() => {
      flow.fitView({ duration: PARAMETER.zoomDuration });
    }, PARAMETER.minimalTimeout);
  }, [toggleResetView, flow, focusCst, filter]);

  function handleSetSelected(newSelection: number[]) {
    controller.setSelected(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  function handleCreateCst() {
    const definition = controller.selected.map(id => controller.schema.cstByID.get(id)!.alias).join(' ');
    controller.createCst(controller.selected.length === 0 ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleDeleteCst() {
    if (!controller.canDeleteSelected) {
      return;
    }
    controller.promptDeleteCst();
  }

  function handleSaveImage() {
    const canvas: HTMLElement | null = document.querySelector('.react-flow__viewport');
    if (canvas === null) {
      toast.error(errorMsg.imageFailed);
      return;
    }

    const imageWidth = PARAMETER.ossImageWidth;
    const imageHeight = PARAMETER.ossImageHeight;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, ZOOM_MIN, ZOOM_MAX);
    toPng(canvas, {
      backgroundColor: APP_COLORS.bgDefault,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: String(imageWidth),
        height: String(imageHeight),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom * 2})`
      }
    })
      .then(dataURL => {
        const a = document.createElement('a');
        a.setAttribute('download', `${controller.schema.alias}.png`);
        a.setAttribute('href', dataURL);
        a.click();
      })
      .catch(error => {
        console.error(error);
        toast.error(errorMsg.imageFailed);
      });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setFocusCst(null);
      handleSetSelected([]);
      return;
    }
    if (!controller.isContentEditable) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      handleDeleteCst();
      return;
    }
  }

  function handleFoldDerived() {
    setFilter({
      ...filter,
      foldDerived: !filter.foldDerived
    });
    setTimeout(() => {
      setToggleResetView(prev => !prev);
    }, PARAMETER.graphRefreshDelay);
  }

  function handleSetFocus(cstID: number | null) {
    if (cstID === null) {
      setFocusCst(null);
    } else {
      const target = controller.schema.cstByID.get(cstID) ?? null;
      setFocusCst(prev => (prev === target ? null : target));
      if (target) {
        controller.setSelected([]);
      }
    }
  }

  function handleNodeClick(event: CProps.EventMouse, cstID: number) {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      handleSetFocus(cstID);
    }
  }

  function handleNodeDoubleClick(event: CProps.EventMouse, cstID: number) {
    event.preventDefault();
    event.stopPropagation();
    controller.navigateCst(cstID);
  }

  function handleNodeEnter(event: CProps.EventMouse, cstID: number) {
    setHoverID(cstID);
    setHoverLeft(
      event.clientX / window.innerWidth >= PARAMETER.graphHoverXLimit ||
        event.clientY / window.innerHeight >= PARAMETER.graphHoverYLimit
    );
  }

  return (
    <>
      <Overlay position='cc-tab-tools' className='flex flex-col items-center rounded-b-2xl cc-blur'>
        <ToolbarTermGraph
          noText={filter.noText}
          foldDerived={filter.foldDerived}
          showParamsDialog={() => showParams()}
          onCreate={handleCreateCst}
          onDelete={handleDeleteCst}
          onFitView={() => setToggleResetView(prev => !prev)}
          onSaveImage={handleSaveImage}
          toggleFoldDerived={handleFoldDerived}
          toggleNoText={() =>
            setFilter({
              ...filter,
              noText: !filter.noText
            })
          }
        />
        {!focusCst ? (
          <ToolbarGraphSelection
            graph={controller.schema.graph}
            isCore={cstID => {
              const cst = controller.schema.cstByID.get(cstID);
              return !!cst && isBasicConcept(cst.cst_type);
            }}
            isOwned={
              controller.schema.inheritance.length > 0
                ? cstID => !controller.schema.cstByID.get(cstID)?.is_inherited
                : undefined
            }
            value={controller.selected}
            onChange={handleSetSelected}
            emptySelection={controller.selected.length === 0}
          />
        ) : null}
        {focusCst ? (
          <ToolbarFocusedCst
            center={focusCst}
            reset={() => handleSetFocus(null)}
            showInputs={filter.focusShowInputs}
            showOutputs={filter.focusShowOutputs}
            toggleShowInputs={() =>
              setFilter({
                ...filter,
                focusShowInputs: !filter.focusShowInputs
              })
            }
            toggleShowOutputs={() =>
              setFilter({
                ...filter,
                focusShowOutputs: !filter.focusShowOutputs
              })
            }
          />
        ) : null}
      </Overlay>

      <div className='cc-fade-in' tabIndex={-1} onKeyDown={handleKeyDown}>
        <SelectedCounter
          hideZero
          totalCount={controller.schema.stats?.count_all ?? 0}
          selectedCount={controller.selected.length}
          position='top-[4.4rem] sm:top-[4.1rem] left-[0.5rem] sm:left-[0.65rem]'
        />

        {hoverCstDebounced ? (
          <Overlay
            layer='z-tooltip'
            position={clsx('top-[3.5rem]', { 'left-[2.6rem]': hoverLeft, 'right-[2.6rem]': !hoverLeft })}
            className={clsx(
              'w-[25rem] max-h-[calc(100dvh-15rem)]',
              'px-3',
              'cc-scroll-y cc-fade-in',
              'border shadow-md',
              'clr-input cc-fade-in',
              'text-sm'
            )}
            style={{
              opacity: !isDragging && hoverCst && hoverCst === hoverCstDebounced ? 1 : 0
            }}
          >
            <InfoConstituenta className='pt-1 pb-2' data={hoverCstDebounced} />
          </Overlay>
        ) : null}

        <Overlay position='top-[6.15rem] sm:top-[5.9rem] left-0' className='flex gap-1 pointer-events-none'>
          <div className='flex flex-col ml-2 w-[13.5rem]'>
            <GraphSelectors schema={controller.schema} coloring={coloring} onChangeColoring={setColoring} />
            <ViewHidden
              items={hidden}
              selected={controller.selected}
              schema={controller.schema}
              coloringScheme={coloring}
              toggleSelection={controller.toggleSelect}
              setFocus={handleSetFocus}
            />
          </div>
        </Overlay>

        <div className='relative outline-none w-[100dvw]' style={{ height: mainHeight }}>
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
            onNodeDragStart={() => setIsDragging(true)}
            onNodeDragStop={() => setIsDragging(false)}
            onNodeMouseEnter={(event, node) => handleNodeEnter(event, Number(node.id))}
            onNodeMouseLeave={() => setHoverID(null)}
            onNodeClick={(event, node) => handleNodeClick(event, Number(node.id))}
            onNodeDoubleClick={(event, node) => handleNodeDoubleClick(event, Number(node.id))}
          />
        </div>
      </div>
    </>
  );
}

export default TGFlow;

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
