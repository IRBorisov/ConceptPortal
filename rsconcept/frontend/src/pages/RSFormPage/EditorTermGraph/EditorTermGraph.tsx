'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { GraphEdge, GraphNode, LayoutTypes } from 'reagraph';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import SelectedCounter from '@/components/info/SelectedCounter';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/OptionsContext';
import DlgGraphParams from '@/dialogs/DlgGraphParams';
import useLocalStorage from '@/hooks/useLocalStorage';
import { GraphColoringScheme, GraphFilterParams } from '@/models/miscellaneous';
import { ConstituentaID, CstType } from '@/models/rsform';
import { colorBgGraphNode } from '@/styling/color';
import { storage, TIMEOUT_GRAPH_REFRESH } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import GraphSidebar from './GraphSidebar';
import GraphToolbar from './GraphToolbar';
import TermGraph from './TermGraph';
import useGraphFilter from './useGraphFilter';
import ViewHidden from './ViewHidden';

interface EditorTermGraphProps {
  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorTermGraph({ selected, setSelected, onOpenEdit }: EditorTermGraphProps) {
  const controller = useRSEdit();
  const { colors } = useConceptOptions();

  const [filterParams, setFilterParams] = useLocalStorage<GraphFilterParams>(storage.rsgraphFilter, {
    noHermits: true,
    noTemplates: false,
    noTransitive: true,
    noText: false,

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
  const filtered = useGraphFilter(controller.schema, filterParams);

  const [hidden, setHidden] = useState<ConstituentaID[]>([]);

  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  const [layout, setLayout] = useLocalStorage<LayoutTypes>(storage.rsgraphLayout, 'treeTd2d');
  const [coloringScheme, setColoringScheme] = useLocalStorage<GraphColoringScheme>(
    storage.rsgraphColoringScheme,
    'type'
  );
  const [orbit, setOrbit] = useState(false);
  const is3D = useMemo(() => layout.includes('3d'), [layout]);

  const [hoverID, setHoverID] = useState<ConstituentaID | undefined>(undefined);
  const hoverCst = useMemo(() => {
    return controller.schema?.items.find(cst => cst.id === hoverID);
  }, [controller.schema?.items, hoverID]);

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
      const cst = controller.schema!.items.find(cst => cst.id === node.id);
      if (cst) {
        result.push({
          id: String(node.id),
          fill: colorBgGraphNode(cst, coloringScheme, colors),
          label: cst.term_resolved && !filterParams.noText ? `${cst.alias}: ${cst.term_resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [controller.schema, coloringScheme, filtered.nodes, filterParams.noText, colors]);

  const edges: GraphEdge[] = useMemo(() => {
    const result: GraphEdge[] = [];
    let edgeID = 1;
    filtered.nodes.forEach(source => {
      source.outputs.forEach(target => {
        result.push({
          id: String(edgeID),
          source: String(source.id),
          target: String(target)
        });
        edgeID += 1;
      });
    });
    return result;
  }, [filtered.nodes]);

  const handleGraphSelection = useCallback(
    (newID: ConstituentaID) => {
      setSelected(prev => [...prev, newID]);
    },
    [setSelected]
  );

  function toggleDismissed(cstID: ConstituentaID) {
    setSelected(prev => {
      if (prev.includes(cstID)) {
        return [...prev.filter(id => id !== cstID)];
      } else {
        return [...prev, cstID];
      }
    });
  }

  function handleCreateCst() {
    if (!controller.schema) {
      return;
    }
    const definition = selected.map(id => controller.schema!.items.find(cst => cst.id === id)!.alias).join(' ');
    controller.createCst(selected.length === 0 ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleDeleteCst() {
    if (!controller.schema || selected.length === 0) {
      return;
    }
    controller.deleteCst();
  }

  function handleChangeLayout(newLayout: LayoutTypes) {
    if (newLayout === layout) {
      return;
    }
    setLayout(newLayout);
    setTimeout(() => {
      setToggleResetView(prev => !prev);
    }, TIMEOUT_GRAPH_REFRESH);
  }

  const handleChangeParams = useCallback(
    (params: GraphFilterParams) => {
      setFilterParams(params);
    },
    [setFilterParams]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Hotkeys implementation
    if (!controller.isContentEditable || controller.isProcessing) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      handleDeleteCst();
    }
  }

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
        selectedCount={selected.length}
        position='top-[0.3rem] left-0'
      />

      <GraphToolbar
        nothingSelected={nothingSelected}
        is3D={is3D}
        orbit={orbit}
        noText={filterParams.noText}
        showParamsDialog={() => setShowParamsDialog(true)}
        onCreate={handleCreateCst}
        onDelete={handleDeleteCst}
        onResetViewpoint={() => setToggleResetView(prev => !prev)}
        toggleOrbit={() => setOrbit(prev => !prev)}
        toggleNoText={() =>
          setFilterParams(prev => ({
            ...prev,
            noText: !prev.noText
          }))
        }
      />

      {hoverCst ? (
        <Overlay
          layer='z-tooltip'
          position='top-[1.6rem] left-[2.6rem]'
          className={clsx('w-[25rem]', 'px-3', 'overflow-y-auto', 'border shadow-md', 'clr-app')}
        >
          <InfoConstituenta className='pt-1 pb-2' data={hoverCst} />
        </Overlay>
      ) : null}

      <Overlay position='top-0 left-0' className='cc-column w-[13.5rem]'>
        <GraphSidebar
          coloring={coloringScheme}
          layout={layout}
          setLayout={handleChangeLayout}
          setColoring={setColoringScheme}
        />
        <ViewHidden
          items={hidden}
          selected={selected}
          schema={controller.schema}
          coloringScheme={coloringScheme}
          toggleSelection={toggleDismissed}
          onEdit={onOpenEdit}
        />
      </Overlay>

      <TermGraph
        nodes={nodes}
        edges={edges}
        selectedIDs={selected}
        layout={layout}
        is3D={is3D}
        orbit={orbit}
        onSelect={handleGraphSelection}
        setHoverID={setHoverID}
        onEdit={onOpenEdit}
        onDeselectAll={() => setSelected([])}
        toggleResetView={toggleResetView}
      />
    </div>
  );
}

export default EditorTermGraph;
