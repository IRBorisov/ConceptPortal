'use client';

import clsx from 'clsx';
import { toPng } from 'html-to-image';
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
  useReactFlow
} from 'reactflow';
import { useStoreApi } from 'reactflow';
import { useDebounce } from 'use-debounce';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import SelectedCounter from '@/components/info/SelectedCounter';
import { CProps } from '@/components/props';
import ToolbarGraphSelection from '@/components/select/ToolbarGraphSelection';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import DlgGraphParams from '@/dialogs/DlgGraphParams';
import useLocalStorage from '@/hooks/useLocalStorage';
import { GraphColoring, GraphFilterParams } from '@/models/miscellaneous';
import { ConstituentaID, CstType, IConstituenta } from '@/models/rsform';
import { isBasicConcept } from '@/models/rsformAPI';
import { APP_COLORS, colorBgGraphNode } from '@/styling/color';
import { PARAMETER, storage } from '@/utils/constants';
import { errors } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';
import { TGEdgeTypes } from './graph/TGEdgeTypes';
import { applyLayout } from './graph/TGLayout';
import { TGNodeData } from './graph/TGNode';
import { TGNodeTypes } from './graph/TGNodeTypes';
import GraphSelectors from './GraphSelectors';
import ToolbarFocusedCst from './ToolbarFocusedCst';
import ToolbarTermGraph from './ToolbarTermGraph';
import useGraphFilter from './useGraphFilter';
import ViewHidden from './ViewHidden';

const ZOOM_MAX = 3;
const ZOOM_MIN = 0.25;

interface TGFlowProps {
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function TGFlow({ onOpenEdit }: TGFlowProps) {
  const { mainHeight } = useConceptOptions();
  const controller = useRSEdit();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const flow = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [filterParams, setFilterParams] = useLocalStorage<GraphFilterParams>(storage.rsgraphFilter, {
    noHermits: true,
    noTemplates: false,
    noTransitive: true,
    noText: false,
    foldDerived: false,

    focusShowInputs: true,
    focusShowOutputs: true,

    allowBase: true,
    allowStruct: true,
    allowTerm: true,
    allowAxiom: true,
    allowFunction: true,
    allowPredicate: true,
    allowConstant: true,
    allowTheorem: true
  });
  const [coloring, setColoring] = useLocalStorage<GraphColoring>(storage.rsgraphColoring, 'type');

  const [focusCst, setFocusCst] = useState<IConstituenta | undefined>(undefined);
  const filteredGraph = useGraphFilter(controller.schema, filterParams, focusCst);
  const [hidden, setHidden] = useState<ConstituentaID[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverID, setHoverID] = useState<ConstituentaID | undefined>(undefined);
  const hoverCst = hoverID && controller.schema?.cstByID.get(hoverID);
  const [hoverCstDebounced] = useDebounce(hoverCst, PARAMETER.graphPopupDelay);
  const [hoverLeft, setHoverLeft] = useState(true);

  const [needReset, setNeedReset] = useState(true);
  const [toggleResetView, setToggleResetView] = useState(false);

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      const ids = nodes.map(node => Number(node.id));
      if (ids.length === 0) {
        controller.setSelected([]);
      } else {
        controller.setSelected(prev => [...prev.filter(nodeID => !filteredGraph.hasNode(nodeID)), ...ids]);
      }
    },
    [controller, filteredGraph]
  );

  useOnSelectionChange({
    onChange: onSelectionChange
  });

  useEffect(() => {
    if (!controller.schema) {
      return;
    }
    const newDismissed: ConstituentaID[] = [];
    controller.schema.items.forEach(cst => {
      if (!filteredGraph.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setHidden(newDismissed);
    setHoverID(undefined);
  }, [controller.schema, filteredGraph]);

  const resetNodes = useCallback(() => {
    const newNodes: Node<TGNodeData>[] = [];
    filteredGraph.nodes.forEach(node => {
      const cst = controller.schema!.cstByID.get(node.id);
      if (cst) {
        newNodes.push({
          id: String(node.id),
          type: 'concept',
          selected: controller.selected.includes(node.id),
          position: { x: 0, y: 0 },
          data: {
            fill: focusCst === cst ? APP_COLORS.bgPurple : colorBgGraphNode(cst, coloring),
            label: cst.alias,
            description: !filterParams.noText ? cst.term_resolved : ''
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

    applyLayout(newNodes, newEdges, !filterParams.noText);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    controller.schema,
    filteredGraph,
    setNodes,
    setEdges,
    filterParams.noText,
    controller.selected,
    focusCst,
    coloring
  ]);

  useEffect(() => {
    setNeedReset(true);
  }, [controller.schema, filterParams.noText, focusCst, coloring, flow.viewportInitialized]);

  useEffect(() => {
    if (!controller.schema || !needReset || !flow.viewportInitialized) {
      return;
    }
    setNeedReset(false);
    resetNodes();
  }, [needReset, controller.schema, resetNodes, flow.viewportInitialized]);

  useEffect(() => {
    setTimeout(() => {
      flow.fitView({ duration: PARAMETER.zoomDuration });
    }, PARAMETER.minimalTimeout);
  }, [toggleResetView, flow, focusCst, filterParams]);

  function handleSetSelected(newSelection: number[]) {
    controller.setSelected(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  function handleCreateCst() {
    if (!controller.schema) {
      return;
    }
    const definition = controller.selected.map(id => controller.schema!.cstByID.get(id)!.alias).join(' ');
    controller.createCst(controller.selected.length === 0 ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleDeleteCst() {
    if (!controller.schema || !controller.canDeleteSelected) {
      return;
    }
    controller.promptDeleteCst();
  }

  function handleChangeParams(params: GraphFilterParams) {
    setFilterParams(params);
  }

  function handleSaveImage() {
    if (!controller.schema) {
      return;
    }
    const canvas: HTMLElement | null = document.querySelector('.react-flow__viewport');
    if (canvas === null) {
      toast.error(errors.imageFailed);
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
        a.setAttribute('download', `${controller.schema?.alias ?? 'graph'}.png`);
        a.setAttribute('href', dataURL);
        a.click();
      })
      .catch(error => {
        console.error(error);
        toast.error(errors.imageFailed);
      });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (controller.isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setFocusCst(undefined);
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
    setFilterParams(prev => ({
      ...prev,
      foldDerived: !prev.foldDerived
    }));
    setTimeout(() => {
      setToggleResetView(prev => !prev);
    }, PARAMETER.graphRefreshDelay);
  }

  function handleSetFocus(cstID: ConstituentaID | undefined) {
    const target = cstID !== undefined ? controller.schema?.cstByID.get(cstID) : cstID;
    setFocusCst(prev => (prev === target ? undefined : target));
    if (target) {
      controller.setSelected([]);
    }
  }

  function handleNodeClick(event: CProps.EventMouse, cstID: ConstituentaID) {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      handleSetFocus(cstID);
    }
  }

  function handleNodeDoubleClick(event: CProps.EventMouse, cstID: ConstituentaID) {
    event.preventDefault();
    event.stopPropagation();
    onOpenEdit(cstID);
  }

  function handleNodeEnter(event: CProps.EventMouse, cstID: ConstituentaID) {
    setHoverID(cstID);
    setHoverLeft(
      event.clientX / window.innerWidth >= PARAMETER.graphHoverXLimit ||
        event.clientY / window.innerHeight >= PARAMETER.graphHoverYLimit
    );
  }

  return (
    <>
      {showParamsDialog ? (
        <DlgGraphParams
          hideWindow={() => setShowParamsDialog(false)}
          initial={filterParams}
          onConfirm={handleChangeParams}
        />
      ) : null}

      <Overlay position='cc-tab-tools' className='flex flex-col items-center rounded-b-2xl cc-blur'>
        <ToolbarTermGraph
          noText={filterParams.noText}
          foldDerived={filterParams.foldDerived}
          showParamsDialog={() => setShowParamsDialog(true)}
          onCreate={handleCreateCst}
          onDelete={handleDeleteCst}
          onFitView={() => setToggleResetView(prev => !prev)}
          onSaveImage={handleSaveImage}
          toggleFoldDerived={handleFoldDerived}
          toggleNoText={() =>
            setFilterParams(prev => ({
              ...prev,
              noText: !prev.noText
            }))
          }
        />
        {!focusCst ? (
          <ToolbarGraphSelection
            graph={controller.schema!.graph}
            isCore={cstID => isBasicConcept(controller.schema?.cstByID.get(cstID)?.cst_type)}
            isOwned={
              controller.schema && controller.schema.inheritance.length > 0
                ? cstID => !controller.schema!.cstByID.get(cstID)?.is_inherited
                : undefined
            }
            selected={controller.selected}
            setSelected={handleSetSelected}
            emptySelection={controller.selected.length === 0}
          />
        ) : null}
        {focusCst ? (
          <ToolbarFocusedCst
            center={focusCst}
            reset={() => handleSetFocus(undefined)}
            showInputs={filterParams.focusShowInputs}
            showOutputs={filterParams.focusShowOutputs}
            toggleShowInputs={() =>
              setFilterParams(prev => ({
                ...prev,
                focusShowInputs: !prev.focusShowInputs
              }))
            }
            toggleShowOutputs={() =>
              setFilterParams(prev => ({
                ...prev,
                focusShowOutputs: !prev.focusShowOutputs
              }))
            }
          />
        ) : null}
      </Overlay>

      <div className='cc-fade-in' tabIndex={-1} onKeyDown={handleKeyDown}>
        <SelectedCounter
          hideZero
          totalCount={controller.schema?.stats?.count_all ?? 0}
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

        <Overlay position='top-[6.15rem] sm:top-[5.9rem] left-0' className='flex gap-1'>
          <div className='flex flex-col ml-2 w-[13.5rem]'>
            <GraphSelectors schema={controller.schema} coloring={coloring} onChangeColoring={setColoring} />
            <ViewHidden
              items={hidden}
              selected={controller.selected}
              schema={controller.schema}
              coloringScheme={coloring}
              toggleSelection={controller.toggleSelect}
              setFocus={handleSetFocus}
              onEdit={onOpenEdit}
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
            onNodeMouseLeave={() => setHoverID(undefined)}
            onNodeClick={(event, node) => handleNodeClick(event, Number(node.id))}
            onNodeDoubleClick={(event, node) => handleNodeDoubleClick(event, Number(node.id))}
          />
        </div>
      </div>
    </>
  );
}

export default TGFlow;
