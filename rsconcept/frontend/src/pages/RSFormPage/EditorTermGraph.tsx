import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GraphCanvas, GraphCanvasRef, GraphEdge, 
  GraphNode, LayoutTypes, Sphere, useSelection
} from 'reagraph';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import SelectSingle from '../../components/Common/SelectSingle';
import ConstituentaTooltip from '../../components/Help/ConstituentaTooltip';
import HelpTermGraph from '../../components/Help/HelpTermGraph';
import InfoConstituenta from '../../components/Help/InfoConstituenta';
import { ArrowsFocusIcon, DumpBinIcon, FilterIcon, HelpIcon, LetterAIcon, LetterALinesIcon, PlanetIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import DlgGraphOptions from '../../dialogs/DlgGraphOptions';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GraphEditorParams } from '../../models/miscelanious';
import { CstType, IConstituenta, ICstCreateData } from '../../models/rsform';
import { graphDarkT, graphLightT, IColorTheme } from '../../utils/color';
import { colorbgCstClass } from '../../utils/color';
import { colorbgCstStatus } from '../../utils/color';
import { prefixes, resources, TIMEOUT_GRAPH_REFRESH } from '../../utils/constants';
import { Graph } from '../../utils/Graph';
import { mapLabelColoring } from '../../utils/labels';
import { mapLableLayout } from '../../utils/labels';
import { SelectorGraphLayout } from '../../utils/selectors';
import { SelectorGraphColoring } from '../../utils/selectors';

export type ColoringScheme = 'none' | 'status' | 'type';
const TREE_SIZE_MILESTONE = 50;

function getCstNodeColor(cst: IConstituenta, coloringScheme: ColoringScheme, colors: IColorTheme): string {
  if (coloringScheme === 'type') {
    return colorbgCstClass(cst.cst_class, colors);
  }
  if (coloringScheme === 'status') {
    return colorbgCstStatus(cst.status, colors);
  }
  return '';
}

interface EditorTermGraphProps {
  onOpenEdit: (cstID: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
}

function EditorTermGraph({ onOpenEdit, onCreateCst, onDeleteCst }: EditorTermGraphProps) {
  const { schema, isEditable } = useRSForm();
  const { darkMode, colors, noNavigation } = useConceptTheme();
  
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'treeTd2d');
  const [ coloringScheme, setColoringScheme ] = useLocalStorage<ColoringScheme>('graph_coloring', 'type');
  const [ orbit, setOrbit ] = useState(false);
  
  const [ noHermits, setNoHermits ] = useLocalStorage('graph_no_hermits', true);
  const [ noTransitive, setNoTransitive ] = useLocalStorage('graph_no_transitive', true);
  const [ noTemplates, setNoTemplates ] = useLocalStorage('graph_no_templates', false);
  const [ noTerms, setNoTerms ] = useLocalStorage('graph_no_terms', false);
  const [ allowBase, setAllowBase ] = useLocalStorage('graph_allow_base', true);
  const [ allowStruct, setAllowStruct ] = useLocalStorage('graph_allow_struct', true);
  const [ allowTerm, setAllowTerm ] = useLocalStorage('graph_allow_term', true);
  const [ allowAxiom, setAllowAxiom ] = useLocalStorage('graph_allow_axiom', true);
  const [ allowFunction, setAllowFunction ] = useLocalStorage('function', true);
  const [ allowPredicate, setAllowPredicate ] = useLocalStorage('graph_allow_predicate', true);
  const [ allowConstant, setAllowConstant ] = useLocalStorage('graph_allow_constant', true);
  const [ allowTheorem, setAllowTheorem ] = useLocalStorage('graph_allow_theorem', true);
  
  const [ filtered, setFiltered ] = useState<Graph>(new Graph());
  const [ dismissed, setDismissed ] = useState<number[]>([]);
  const [ selectedDismissed, setSelectedDismissed ] = useState<number[]>([]);
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [toggleUpdate, setToggleUpdate] = useState(false);
  
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverCst = useMemo(
  () => {
    return schema?.items.find(cst => cst.id === hoverID);
  }, [schema?.items, hoverID]);

  const is3D = useMemo(() => layout.includes('3d'), [layout]);
  const allowedTypes: CstType[] = useMemo(
  () => {
    const result: CstType[]  = [];
    if (allowBase) result.push(CstType.BASE);
    if (allowStruct) result.push(CstType.STRUCTURED);
    if (allowTerm) result.push(CstType.TERM);
    if (allowAxiom) result.push(CstType.AXIOM);
    if (allowFunction) result.push(CstType.FUNCTION);
    if (allowPredicate) result.push(CstType.PREDICATE);
    if (allowConstant) result.push(CstType.CONSTANT);
    if (allowTheorem) result.push(CstType.THEOREM);
    return result;
  }, [allowBase, allowStruct, allowTerm, allowAxiom, allowFunction, allowPredicate, allowConstant, allowTheorem]);

  useLayoutEffect(
  () => {
    if (!schema) {
      setFiltered(new Graph());
      return;
    }
    const graph = schema.graph.clone();
    if (noHermits) {
      graph.removeIsolated();
    }
    if (noTransitive) {
      graph.transitiveReduction();
    }
    if (noTemplates) {
      schema.items.forEach(cst => {
        if (cst.is_template) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (allowedTypes.length < Object.values(CstType).length) {
      schema.items.forEach(cst => {
        if (!allowedTypes.includes(cst.cst_type)) {
          graph.foldNode(cst.id);
        }
      });
    }
    const newDismissed: number[] = [];
    schema.items.forEach(cst => {
      if (!graph.nodes.has(cst.id)) {
        newDismissed.push(cst.id);
      }
    });
    setFiltered(graph);
    setDismissed(newDismissed);
    setSelectedDismissed([]);
    setHoverID(undefined);
  }, [schema, noHermits, noTransitive, noTemplates, allowedTypes, toggleUpdate]);

  function toggleDismissed(cstID: number) {
    setSelectedDismissed(prev => {
      const index = prev.findIndex(id => cstID === id);
      if (index !== -1) {
        prev.splice(index, 1);
      } else {
        prev.push(cstID);
      }
      return [... prev];
    });
  }

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
          fill: getCstNodeColor(cst, coloringScheme, colors),
          label: cst.term_resolved && !noTerms ? `${cst.alias}: ${cst.term_resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [schema, coloringScheme, filtered.nodes, noTerms, colors]);

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
  
  const { 
    selections, actives,
    onNodeClick,
    clearSelections,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    type: 'multi', // 'single' | 'multi' | 'multiModifier'
    pathSelectionType: 'out',
    pathHoverType: 'all',
    focusOnSelect: false
  });

  const allSelected: number[] = useMemo(
  () => {
    return [ ... selectedDismissed, ... selections.map(id => Number(id))];
  }, [selectedDismissed, selections]);
  const nothingSelected = useMemo(() => allSelected.length === 0, [allSelected]);

  const handleResetViewpoint = useCallback(
  () => {
    graphRef.current?.resetControls(true);
    graphRef.current?.centerGraph();
  }, []);

  const handleHoverIn = useCallback(
  (node: GraphNode) => {
    setHoverID(Number(node.id));
    if (onNodePointerOver) onNodePointerOver(node);
  }, [onNodePointerOver]);

  const handleHoverOut = useCallback(
  (node: GraphNode) => {
    setHoverID(undefined);
    if (onNodePointerOut) onNodePointerOut(node);
  }, [onNodePointerOut]);

  const handleNodeClick = useCallback(
  (node: GraphNode) => {
    if (selections.includes(node.id)) {
      onOpenEdit(Number(node.id));
      return;
    }
    if (onNodeClick) onNodeClick(node);
  }, [onNodeClick, selections, onOpenEdit]);

  const handleCanvasClick = useCallback(
  (event: MouseEvent) => {
    setSelectedDismissed([]);
    if (onCanvasClick) onCanvasClick(event);
  }, [onCanvasClick]);

  // Implement hotkeys for editing
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isEditable) {
      return;
    }
    if (event.key === 'Delete' && allSelected.length > 0) {
      event.preventDefault();
      handleDeleteCst();
    }
  }

  function handleCreateCst() {
    if (!schema) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: null,
      cst_type: allSelected.length === 0 ? CstType.BASE: CstType.TERM,
      alias: '',
      term_raw: '',
      definition_formal: allSelected.map(id => schema.items.find(cst => cst.id === id)!.alias).join(' '),
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    onCreateCst(data);
  }

  function handleDeleteCst() {
    if (!schema) {
      return;
    }
    onDeleteCst(allSelected, () => {
      clearSelections();
      setDismissed([]);
      setSelectedDismissed([]);
      setToggleUpdate(prev => !prev);
    });
  }

  function handleChangeLayout(newLayout: LayoutTypes) {
    if (newLayout === layout) {
      return;
    }
    setLayout(newLayout);
    setTimeout(() => {
      handleResetViewpoint();
    }, TIMEOUT_GRAPH_REFRESH);
  }

  function getOptions() {
    return {
      noHermits: noHermits,
      noTemplates: noTemplates,
      noTransitive: noTransitive,
      noTerms: noTerms,

      allowBase: allowBase,
      allowStruct: allowStruct,
      allowTerm: allowTerm,
      allowAxiom: allowAxiom,
      allowFunction: allowFunction,
      allowPredicate: allowPredicate,
      allowConstant: allowConstant,
      allowTheorem: allowTheorem
    }
  }

  const handleChangeOptions = useCallback(
  (params: GraphEditorParams) => {
    setNoHermits(params.noHermits);
    setNoTransitive(params.noTransitive);
    setNoTemplates(params.noTemplates);
    setNoTerms(params.noTerms);

    setAllowBase(params.allowBase);
    setAllowStruct(params.allowStruct);
    setAllowTerm(params.allowTerm);
    setAllowAxiom(params.allowAxiom);
    setAllowFunction(params.allowFunction);
    setAllowPredicate(params.allowPredicate);
    setAllowConstant(params.allowConstant);
    setAllowTheorem(params.allowTheorem);
  }, [setNoHermits, setNoTransitive, setNoTemplates, 
    setAllowBase, setAllowStruct, setAllowTerm, setAllowAxiom, setAllowFunction, 
    setAllowPredicate, setAllowConstant, setAllowTheorem, setNoTerms]);

  const canvasWidth = useMemo(
  () => {
    return 'calc(100vw - 1.1rem)';
  }, []);

  const canvasHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 9.8rem - 4px)'
    : 'calc(100vh - 3rem - 4px)';
  }, [noNavigation]);

  const dismissedHeight = useMemo(
    () => {
      return !noNavigation ? 
        'calc(100vh - 28rem - 4px)'
      : 'calc(100vh - 22.2rem - 4px)';
    }, [noNavigation]);

  const dismissedStyle = useCallback(
  (cstID: number) => {
    return selectedDismissed.includes(cstID) ? {outlineWidth: '2px', outlineStyle: 'solid'}: {};
  }, [selectedDismissed]);

  return (<>
    {showOptions && 
    <DlgGraphOptions
      hideWindow={() => setShowOptions(false)}
      initial={getOptions()}
      onConfirm={handleChangeOptions}
    />}

    { allSelected.length > 0 && 
    <div className='relative w-full z-pop'>
    <div className='absolute top-0 left-0 px-2 select-none whitespace-nowrap small-caps clr-app'>
      Выбор {allSelected.length} из {schema?.stats?.count_all ?? 0}
    </div>
    </div>}

    <div className='relative w-full z-pop'>
    <div className='absolute right-0 flex items-start justify-center w-full top-1'>
      <MiniButton
        tooltip='Настройки фильтрации узлов и связей'
        icon={<FilterIcon color='text-primary' size={5}/>}
        onClick={() => setShowOptions(true)}
      />
      <MiniButton
        tooltip={ !noTerms ? 'Скрыть текст' : 'Отобразить текст' }
        icon={ !noTerms ? <LetterALinesIcon color='text-success' size={5}/> : <LetterAIcon color='text-primary' size={5}/> }
        onClick={() => setNoTerms(prev => !prev)}
      />
      <MiniButton
        tooltip='Новая конституента'
        icon={<SmallPlusIcon color={isEditable ? 'text-success': ''} size={5}/>}
        disabled={!isEditable}
        onClick={handleCreateCst}
      />
      <MiniButton
        tooltip='Удалить выбранные'
        icon={<DumpBinIcon color={isEditable && !nothingSelected ? 'text-warning' : ''} size={5}/>}
        disabled={!isEditable || nothingSelected}
        onClick={handleDeleteCst}
      />
      <MiniButton
        icon={<ArrowsFocusIcon color='text-primary' size={5} />}
        tooltip='Восстановить камеру'
        onClick={handleResetViewpoint}
      />
      <MiniButton
        icon={<PlanetIcon color={ !is3D ? '' : orbit ? 'text-success' : 'text-primary'} size={5} />}
        tooltip='Анимация вращения'
        disabled={!is3D}
        onClick={() => setOrbit(prev => !prev) }
      />
      <div className='px-1 py-1' id='items-graph-help' >
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip anchorSelect='#items-graph-help'>
        <div className='text-sm max-w-[calc(100vw-20rem)] z-tooltip'>
          <HelpTermGraph />
        </div>
      </ConceptTooltip>
    </div>
    </div>

    {hoverCst && 
    <div className='relative'>
      <InfoConstituenta
        data={hoverCst}
        className='absolute top-[1.6rem] left-[2.6rem] z-tooltip w-[25rem] min-h-[11rem] shadow-md overflow-y-auto border h-fit clr-app px-3' 
      />
    </div>}

    <div className='relative z-pop'>
    <div className='absolute top-0 left-0 flex flex-col max-w-[13.5rem] min-w-[13.5rem]'>
      <div className='flex flex-col px-2 pb-2 mt-8 text-sm select-none h-fit'>        
        <div className='flex items-center w-full gap-1 text-sm'>
          <SelectSingle
            options={SelectorGraphColoring}
            isSearchable={false}
            placeholder='Выберите цвет'
            value={coloringScheme ? { value: coloringScheme, label: mapLabelColoring.get(coloringScheme) } : null}
            onChange={data => setColoringScheme(data?.value ?? SelectorGraphColoring[0].value)}
          />
        </div>
        <SelectSingle
          className='w-full mt-1'
          options={SelectorGraphLayout}
          isSearchable={false}
          placeholder='Способ расположения'
          value={layout ? { value: layout, label: mapLableLayout.get(layout) } : null}
          onChange={data => handleChangeLayout(data?.value ?? SelectorGraphLayout[0].value)}
        />
      </div>
      {dismissed.length > 0 &&
      <div className='flex flex-col text-sm ml-2 border clr-app max-w-[12.5rem] min-w-[12.5rem]'>
        <p className='py-2 text-center'><b>Скрытые конституенты</b></p>
        <div className='flex flex-wrap justify-center gap-2 pb-2 overflow-y-auto' style={{maxHeight: dismissedHeight}}>
        {dismissed.map(cstID => {
          const cst = schema!.items.find(cst => cst.id === cstID)!;
          const adjustedColoring = coloringScheme === 'none' ? 'status': coloringScheme;
          const id = `${prefixes.cst_hidden_list}${cst.alias}`
          return (<div key={`wrap-${id}`}>
            <div
              key={id}
              id={id}
              className='w-fit min-w-[3rem] rounded-md text-center cursor-pointer select-none'
              style={{ 
                backgroundColor: getCstNodeColor(cst, adjustedColoring, colors),
                ...dismissedStyle(cstID)
              }}
              onClick={() => toggleDismissed(cstID)}
              onDoubleClick={() => onOpenEdit(cstID)}
            >
              {cst.alias}
            </div>
            <ConstituentaTooltip
              data={cst}
              anchor={`#${id}`}
            />
          </div>);
        })}
        </div>
      </div>}
    </div>
    </div>

    <div className='w-full h-full overflow-auto outline-none' tabIndex={-1} onKeyDown={handleKeyDown}>
    <div 
      className='relative'
      style={{width: canvasWidth, height: canvasHeight}}
    >
      <GraphCanvas
        draggable
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        layoutType={layout}
        selections={selections}
        actives={actives}
        onNodeClick={handleNodeClick}
        onCanvasClick={handleCanvasClick}
        onNodePointerOver={handleHoverIn}
        onNodePointerOut={handleHoverOut}
        cameraMode={ orbit ? 'orbit' : is3D ? 'rotate' : 'pan'}
        layoutOverrides={ 
          layout.includes('tree') ? { nodeLevelRatio: filtered.nodes.size < TREE_SIZE_MILESTONE ? 3 : 1 } 
          : undefined
        }
        labelFontUrl={resources.graph_font}
        theme={darkMode ? graphDarkT : graphLightT}
        renderNode={({ node, ...rest }) => (
          <Sphere {...rest} node={node} />
        )}
      />
    </div>
  </div></>);
}


export default EditorTermGraph;
