import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { GraphEdge, GraphNode, LayoutTypes } from 'reagraph';

import InfoConstituenta from '../../../components/Shared/InfoConstituenta';
import { useRSForm } from '../../../context/RSFormContext';
import { useConceptTheme } from '../../../context/ThemeContext';
import DlgGraphParams from '../../../dialogs/DlgGraphParams';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { GraphColoringScheme, GraphFilterParams } from '../../../models/miscelanious';
import { CstType, ICstCreateData } from '../../../models/rsform';
import { colorbgGraphNode } from '../../../utils/color';
import { TIMEOUT_GRAPH_REFRESH } from '../../../utils/constants';
import GraphSidebar from './GraphSidebar';
import GraphToolbar from './GraphToolbar';
import SelectedCounter from './SelectedCounter';
import TermGraph from './TermGraph';
import useGraphFilter from './useGraphFilter';
import ViewHidden from './ViewHidden';

interface EditorTermGraphProps {
  onOpenEdit: (cstID: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
}

function EditorTermGraph({ onOpenEdit, onCreateCst, onDeleteCst }: EditorTermGraphProps) {
  const { schema, editorMode: isEditable } = useRSForm();
  const { colors } = useConceptTheme();

  const [toggleDataUpdate, setToggleDataUpdate] = useState(false);
  const [filterParams, setFilterParams] = useLocalStorage<GraphFilterParams>('graph_filter', {
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
  const filtered = useGraphFilter(schema, filterParams, toggleDataUpdate);

  const [selectedGraph, setSelectedGraph] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number[]>([]);
  const [selectedHidden, setSelectedHidden] = useState<number[]>([]);
  const selected: number[] = useMemo(
  () => {
    return [...selectedHidden, ...selectedGraph];
  }, [selectedHidden, selectedGraph]);
  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  const [layout, setLayout] = useLocalStorage<LayoutTypes>('graph_layout', 'treeTd2d');
  const is3D = useMemo(() => layout.includes('3d'), [layout]);
  const [coloringScheme, setColoringScheme] = useLocalStorage<GraphColoringScheme>('graph_coloring', 'type');
  const [orbit, setOrbit] = useState(false);
  
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverCst = useMemo(
  () => {
    return schema?.items.find(cst => cst.id === hoverID);
  }, [schema?.items, hoverID]);

  const [toggleResetView, setToggleResetView] = useState(false);
  const [toggleResetSelection, setToggleResetSelection] = useState(false);

  useLayoutEffect(
  () => {
    if (!schema) {
      return;
    }
    const newDismissed: number[] = [];
    schema.items.forEach(cst => {
      if (!filtered.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setHidden(newDismissed);
    setSelectedHidden([]);
    setHoverID(undefined);
  }, [schema, filtered, toggleDataUpdate]);

  const nodes: GraphNode[] = useMemo(
  () => {
    const result: GraphNode[] = [];
    if (!schema) {
      return result;
    }
    filtered.nodes.forEach(node => {
      const cst = schema.items.find(cst => cst.id === node.id);
      if (cst) {
        result.push({
          id: String(node.id),
          fill: colorbgGraphNode(cst, coloringScheme, colors),
          label: cst.term_resolved && !filterParams.noText ? `${cst.alias}: ${cst.term_resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [schema, coloringScheme, filtered.nodes, filterParams.noText, colors]);

  const edges: GraphEdge[] = useMemo(
  () => {
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

  function toggleDismissed(cstID: number) {
    setSelectedHidden(prev => {
      const index = prev.findIndex(id => cstID === id);
      if (index !== -1) {
        prev.splice(index, 1);
      } else {
        prev.push(cstID);
      }
      return [...prev];
    });
  }

  function handleCreateCst() {
    if (!schema) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: null,
      cst_type: selected.length === 0 ? CstType.BASE: CstType.TERM,
      alias: '',
      term_raw: '',
      definition_formal: selected.map(id => schema.items.find(cst => cst.id === id)!.alias).join(' '),
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    onCreateCst(data);
  }

  function handleDeleteCst() {
    if (!schema || selected.length === 0) {
      return;
    }
    onDeleteCst(selected, () => {
      setHidden([]);
      setSelectedHidden([]);
      setToggleResetSelection(prev => !prev);
      setToggleDataUpdate(prev => !prev);
    });
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
  }, [setFilterParams]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Hotkeys implementation
    if (!isEditable) {
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      handleDeleteCst();
    }
  }

  return (
  <div tabIndex={-1} onKeyDown={handleKeyDown}>
    {showParamsDialog ?
    <DlgGraphParams
      hideWindow={() => setShowParamsDialog(false)}
      initial={filterParams}
      onConfirm={handleChangeParams}
    /> : null}

    <SelectedCounter 
      total={schema?.stats?.count_all ?? 0}
      selected={selected.length}
    />

    <GraphToolbar
      editorMode={isEditable}
      nothingSelected={nothingSelected}
      is3D={is3D}
      orbit={orbit}
      noText={filterParams.noText}

      showParamsDialog={() => setShowParamsDialog(true)}
      onCreate={handleCreateCst}
      onDelete={handleDeleteCst}
      onResetViewpoint={() => setToggleResetView(prev => !prev)}

      toggleOrbit={() => setOrbit(prev => !prev)}
      toggleNoText={() => setFilterParams(
        (prev) => ({
          ...prev,
          noText: !prev.noText
        })
      )}
    />

    {hoverCst ?
    <div className='relative'>
      <InfoConstituenta
        data={hoverCst}
        className='absolute top-[1.6rem] left-[2.6rem] z-tooltip w-[25rem] min-h-[11rem] shadow-md overflow-y-auto border h-fit clr-app px-3' 
      />
    </div> : null}

    <div className='relative z-pop'>
    <div className='absolute top-0 left-0 flex flex-col gap-3 max-w-[13.5rem] min-w-[13.5rem]'>
      <GraphSidebar 
        coloring={coloringScheme}
        layout={layout}
        setLayout={handleChangeLayout}
        setColoring={setColoringScheme}
      />
      <ViewHidden 
        items={hidden}
        selected={selectedHidden}
        schema={schema!}
        coloringScheme={coloringScheme}
        toggleSelection={toggleDismissed}
        onEdit={onOpenEdit}
      />
    </div>
    </div>

    <TermGraph 
      nodes={nodes}
      edges={edges}
      layout={layout}
      is3D={is3D}
      orbit={orbit}

      setSelected={setSelectedGraph}
      setHoverID={setHoverID}
      onEdit={onOpenEdit}
      onDeselect={() => setSelectedHidden([])}
      
      toggleResetView={toggleResetView}
      toggleResetSelection={toggleResetSelection}
    />
    </div>);
}

export default EditorTermGraph;
