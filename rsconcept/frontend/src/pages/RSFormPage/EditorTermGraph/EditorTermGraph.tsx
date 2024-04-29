'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import fileDownload from 'js-file-download';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import SelectedCounter from '@/components/info/SelectedCounter';
import SelectGraphToolbar from '@/components/select/SelectGraphToolbar';
import { GraphCanvasRef, GraphEdge, GraphLayout, GraphNode } from '@/components/ui/GraphUI';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/OptionsContext';
import DlgGraphParams from '@/dialogs/DlgGraphParams';
import useLocalStorage from '@/hooks/useLocalStorage';
import { GraphColoring, GraphFilterParams, GraphSizing } from '@/models/miscellaneous';
import { applyNodeSizing } from '@/models/miscellaneousAPI';
import { ConstituentaID, CstType, IConstituenta } from '@/models/rsform';
import { isBasicConcept } from '@/models/rsformAPI';
import { colorBgGraphNode } from '@/styling/color';
import { PARAMETER, storage } from '@/utils/constants';
import { convertBase64ToBlob } from '@/utils/utils';

import { useRSEdit } from '../RSEditContext';
import FocusToolbar from './FocusToolbar';
import GraphSelectors from './GraphSelectors';
import GraphToolbar from './GraphToolbar';
import TermGraph from './TermGraph';
import useGraphFilter from './useGraphFilter';
import ViewHidden from './ViewHidden';

interface EditorTermGraphProps {
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorTermGraph({ onOpenEdit }: EditorTermGraphProps) {
  const controller = useRSEdit();
  const { colors } = useConceptOptions();

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
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [focusCst, setFocusCst] = useState<IConstituenta | undefined>(undefined);
  const filtered = useGraphFilter(controller.schema, filterParams, focusCst);

  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [hidden, setHidden] = useState<ConstituentaID[]>([]);

  const [layout, setLayout] = useLocalStorage<GraphLayout>(storage.rsgraphLayout, 'treeTd2d');
  const [coloring, setColoring] = useLocalStorage<GraphColoring>(storage.rsgraphColoring, 'type');
  const [sizing, setSizing] = useLocalStorage<GraphSizing>(storage.rsgraphSizing, 'derived');
  const [orbit, setOrbit] = useState(false);
  const is3D = useMemo(() => layout.includes('3d'), [layout]);

  const [hoverID, setHoverID] = useState<ConstituentaID | undefined>(undefined);
  const hoverCst = useMemo(() => {
    return hoverID && controller.schema?.cstByID.get(hoverID);
  }, [controller.schema?.cstByID, hoverID]);
  const [hoverCstDebounced] = useDebounce(hoverCst, PARAMETER.graphPopupDelay);
  const [hoverLeft, setHoverLeft] = useState(true);

  const [toggleResetView, setToggleResetView] = useState(false);

  useLayoutEffect(() => {
    if (!controller.schema) {
      return;
    }
    const newDismissed: ConstituentaID[] = [];
    controller.schema.items.forEach(cst => {
      if (!filtered.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setHidden(newDismissed);
    setHoverID(undefined);
  }, [controller.schema, filtered]);

  const nodes: GraphNode[] = useMemo(() => {
    const result: GraphNode[] = [];
    if (!controller.schema) {
      return result;
    }
    filtered.nodes.forEach(node => {
      const cst = controller.schema!.cstByID.get(node.id);
      if (cst) {
        result.push({
          id: String(node.id),
          fill: focusCst === cst ? colors.bgPurple : colorBgGraphNode(cst, coloring, colors),
          label: cst.alias,
          subLabel: !filterParams.noText ? cst.term_resolved : undefined,
          size: applyNodeSizing(cst, sizing)
        });
      }
    });
    return result;
  }, [controller.schema, coloring, sizing, filtered.nodes, filterParams.noText, colors, focusCst]);

  const edges: GraphEdge[] = useMemo(() => {
    const result: GraphEdge[] = [];
    let edgeID = 1;
    filtered.nodes.forEach(source => {
      source.outputs.forEach(target => {
        if (nodes.find(node => node.id === String(target))) {
          result.push({
            id: String(edgeID),
            source: String(source.id),
            target: String(target)
          });
          edgeID += 1;
        }
      });
    });
    return result;
  }, [filtered.nodes, nodes]);

  function handleCreateCst() {
    if (!controller.schema) {
      return;
    }
    const definition = controller.selected.map(id => controller.schema!.cstByID.get(id)!.alias).join(' ');
    controller.createCst(controller.nothingSelected ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleDeleteCst() {
    if (!controller.schema || controller.nothingSelected) {
      return;
    }
    controller.deleteCst();
  }

  function handleChangeLayout(newLayout: GraphLayout) {
    if (newLayout === layout) {
      return;
    }
    setLayout(newLayout);
    setTimeout(() => {
      setToggleResetView(prev => !prev);
    }, PARAMETER.graphRefreshDelay);
  }

  const handleChangeParams = useCallback(
    (params: GraphFilterParams) => {
      setFilterParams(params);
    },
    [setFilterParams]
  );

  const handleSaveImage = useCallback(() => {
    if (!graphRef?.current) {
      return;
    }
    const data = graphRef.current.exportCanvas();
    try {
      fileDownload(convertBase64ToBlob(data), 'graph.png', 'data:image/png;base64');
    } catch (error) {
      console.error(error);
    }
  }, [graphRef]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Hotkeys implementation
    if (controller.isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setFocusCst(undefined);
      controller.deselectAll();
      return;
    }
    if (!controller.isContentEditable) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      handleDeleteCst();
      return;
    }
  }

  const handleFoldDerived = useCallback(() => {
    setFilterParams(prev => ({
      ...prev,
      foldDerived: !prev.foldDerived
    }));
    setTimeout(() => {
      setToggleResetView(prev => !prev);
    }, PARAMETER.graphRefreshDelay);
  }, [setFilterParams, setToggleResetView]);

  const handleSetFocus = useCallback(
    (cstID: ConstituentaID | undefined) => {
      const target = cstID !== undefined ? controller.schema?.cstByID.get(cstID) : cstID;
      setFocusCst(prev => (prev === target ? undefined : target));
      if (target) {
        controller.setSelected([]);
      }
    },
    [controller]
  );

  const graph = useMemo(
    () => (
      <TermGraph
        graphRef={graphRef}
        nodes={nodes}
        edges={edges}
        selectedIDs={controller.selected}
        layout={layout}
        is3D={is3D}
        orbit={orbit}
        onSelect={controller.select}
        onDeselect={controller.deselect}
        setHoverID={setHoverID}
        onEdit={onOpenEdit}
        onSelectCentral={handleSetFocus}
        toggleResetView={toggleResetView}
        setHoverLeft={setHoverLeft}
      />
    ),
    [
      graphRef,
      edges,
      nodes,
      controller.selected,
      layout,
      is3D,
      orbit,
      setHoverID,
      onOpenEdit,
      toggleResetView,
      controller.select,
      controller.deselect,
      handleSetFocus
    ]
  );

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown}>
      <AnimatePresence>
        {showParamsDialog ? (
          <DlgGraphParams
            hideWindow={() => setShowParamsDialog(false)}
            initial={filterParams}
            onConfirm={handleChangeParams}
          />
        ) : null}
      </AnimatePresence>

      <SelectedCounter
        hideZero
        totalCount={controller.schema?.stats?.count_all ?? 0}
        selectedCount={controller.selected.length}
        position='top-[4.3rem] sm:top-[0.3rem] left-0'
      />

      <Overlay
        position='top-0 pt-1 right-1/2 translate-x-1/2'
        className='flex flex-col items-center rounded-b-2xl cc-blur'
      >
        <GraphToolbar
          is3D={is3D}
          orbit={orbit}
          noText={filterParams.noText}
          foldDerived={filterParams.foldDerived}
          showParamsDialog={() => setShowParamsDialog(true)}
          onCreate={handleCreateCst}
          onDelete={handleDeleteCst}
          onResetViewpoint={() => setToggleResetView(prev => !prev)}
          onSaveImage={handleSaveImage}
          toggleOrbit={() => setOrbit(prev => !prev)}
          toggleFoldDerived={handleFoldDerived}
          toggleNoText={() =>
            setFilterParams(prev => ({
              ...prev,
              noText: !prev.noText
            }))
          }
        />
        {!focusCst ? (
          <SelectGraphToolbar
            graph={controller.schema!.graph}
            core={controller.schema!.items.filter(cst => isBasicConcept(cst.cst_type)).map(cst => cst.id)}
            setSelected={controller.setSelected}
          />
        ) : null}
        {focusCst ? (
          <FocusToolbar
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

      {hoverCst && hoverCstDebounced && hoverCst === hoverCstDebounced ? (
        <Overlay
          layer='z-tooltip'
          position={clsx('top-[1.6rem]', { 'left-[2.6rem]': hoverLeft, 'right-[2.6rem]': !hoverLeft })}
          className={clsx('w-[25rem]', 'px-3', 'overflow-y-auto', 'border shadow-md', 'clr-app')}
        >
          <InfoConstituenta className='pt-1 pb-2' data={hoverCstDebounced} />
        </Overlay>
      ) : null}

      <Overlay position='top-[6.25rem] sm:top-9 left-0' className='flex gap-1'>
        <div className='flex flex-col ml-2 w-[13.5rem]'>
          <GraphSelectors
            coloring={coloring}
            layout={layout}
            sizing={sizing}
            setLayout={handleChangeLayout}
            setColoring={setColoring}
            setSizing={setSizing}
          />
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

      {graph}
    </div>
  );
}

export default EditorTermGraph;
