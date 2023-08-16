import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { darkTheme, GraphCanvas, GraphCanvasRef, GraphEdge, 
  GraphNode, LayoutTypes, lightTheme, Sphere, useSelection
} from 'reagraph';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import ConceptSelect from '../../components/Common/ConceptSelect';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import InfoConstituenta from '../../components/Help/InfoConstituenta';
import InfoCstClass from '../../components/Help/InfoCstClass';
import CstStatusInfo from '../../components/Help/InfoCstStatus';
import { ArrowsRotateIcon, DumpBinIcon, FilterCogIcon, HelpIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { prefixes, resources } from '../../utils/constants';
import { Graph } from '../../utils/Graph';
import { CstType, IConstituenta, ICstCreateData } from '../../utils/models';
import { getCstClassColor, getCstStatusColor, 
  GraphColoringSelector, GraphLayoutSelector,
  mapColoringLabels, mapLayoutLabels
} from '../../utils/staticUI';
import DlgGraphOptions from './DlgGraphOptions';
import ConstituentaTooltip from './elements/ConstituentaTooltip';

export type ColoringScheme = 'none' | 'status' | 'type';
const TREE_SIZE_MILESTONE = 50;

function getCstNodeColor(cst: IConstituenta, coloringScheme: ColoringScheme, darkMode: boolean): string {
  if (coloringScheme === 'type') {
    return getCstClassColor(cst.cstClass, darkMode);
  }
  if (coloringScheme === 'status') {
    return getCstStatusColor(cst.status, darkMode);
  }
  return (darkMode ? '#7a8c9e' :'#7ca0ab');
}

export interface GraphEditorParams {
  noHermits: boolean
  noTransitive: boolean
  noTemplates: boolean
  noTerms: boolean

  allowBase: boolean
  allowStruct: boolean
  allowTerm: boolean
  allowAxiom: boolean
  allowFunction: boolean
  allowPredicate: boolean
  allowConstant: boolean
  allowTheorem: boolean
}

interface EditorTermGraphProps {
  onOpenEdit: (cstID: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
}

function EditorTermGraph({ onOpenEdit, onCreateCst, onDeleteCst }: EditorTermGraphProps) {
  const { schema, isEditable } = useRSForm();
  const { darkMode, noNavigation } = useConceptTheme();
  
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'treeTd2d');
  const [ coloringScheme, setColoringScheme ] = useLocalStorage<ColoringScheme>('graph_coloring', 'none');
  const [ orbit, setOrbit ] = useState(false);
  
  const [ noHermits, setNoHermits ] = useLocalStorage('graph_no_hermits', true);
  const [ noTransitive, setNoTransitive ] = useLocalStorage('graph_no_transitive', false);
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
  
  const [hoverID, setHoverID] = useState<string | undefined>(undefined);
  const hoverCst = useMemo(
  () => {
    return schema?.items.find(cst => String(cst.id) == hoverID);
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
        if (cst.isTemplate) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (allowedTypes.length < Object.values(CstType).length) {
      schema.items.forEach(cst => {
        if (!allowedTypes.includes(cst.cstType)) {
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
      const index = prev.findIndex(id => cstID == id);
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
          fill: getCstNodeColor(cst, coloringScheme, darkMode),
          label: cst.term.resolved && !noTerms ? `${cst.alias}: ${cst.term.resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [schema, coloringScheme, filtered.nodes, darkMode, noTerms]);

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

  const allSelected: string[] = useMemo(
  () => {
    return [ ... selectedDismissed.map(id => String(id)), ... selections];
  }, [selectedDismissed, selections]);
  const nothingSelected = useMemo(() => allSelected.length === 0, [allSelected]);

  const handleRecreate = useCallback(
  () => {
    graphRef.current?.resetControls();
    graphRef.current?.centerGraph();
  }, []);

  const handleHoverIn = useCallback(
  (node: GraphNode) => {
    setHoverID(node.id);
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
    console.log(event);
    if (!isEditable) {
      return;
    }
    if (event.key === 'Delete' && allSelected.length > 0) {
      event.preventDefault();
      handleDeleteCst();
      return;
    }
  }

  function handleCreateCst() {
    if (!schema) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: null,
      cst_type: allSelected.length == 0 ? CstType.BASE: CstType.TERM,
      alias: '',
      term_raw: '',
      definition_formal: allSelected.map(id => schema.items.find(cst => cst.id === Number(id))!.alias).join(' '),
      definition_raw: '',
      convention: '',
    };
    onCreateCst(data);
  }

  function handleDeleteCst() {
    if (!schema) {
      return;
    }
    onDeleteCst([... allSelected.map(id => Number(id))], () => {
      clearSelections();
      setDismissed([]);
      setSelectedDismissed([]);
      setToggleUpdate(prev => !prev);
    });
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
    return 'calc(100vw - 14.6rem)';
  }, []);

  const canvasHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 13rem)'
    : 'calc(100vh - 2rem)';
  }, [noNavigation]);

  const dismissedStyle = useCallback(
  (cstID: number) => {
    return selectedDismissed.includes(cstID) ? {outlineWidth: '2px', outlineStyle: 'solid'}: {};
  }, [selectedDismissed]);

  return (
    <div className='flex justify-between w-full outline-none' tabIndex={0} onKeyDown={handleKeyDown}>
    {showOptions && 
    <DlgGraphOptions
      hideWindow={() => setShowOptions(false)}
      initial={getOptions()}
      onConfirm={handleChangeOptions}
    />}
    <div className='flex flex-col border-t border-r max-w-[12.44rem] pr-2 pb-2 text-sm select-none' style={{height: canvasHeight}}>
      {hoverCst && 
      <div className='relative'>
        <InfoConstituenta 
          data={hoverCst}
          className='absolute top-0 left-0 z-50 w-[25rem] min-h-[11rem] overflow-y-auto border h-fit clr-app px-3' 
        />
      </div>}
      
      <div className='flex items-center justify-between py-1'>
        <div className='mr-3 whitespace-nowrap'>
          Выбраны
          <span className='ml-1'>
            <b>{allSelected.length}</b> из {schema?.stats?.count_all ?? 0}
          </span>
        </div>
        <div>
          <MiniButton
            tooltip='Удалить выбранные'
            icon={<DumpBinIcon color={!nothingSelected ? 'text-red' : ''} size={5}/>}
            disabled={!isEditable || nothingSelected}
            onClick={handleDeleteCst}
          />
          <MiniButton
            tooltip='Новая конституента'
            icon={<SmallPlusIcon color='text-green' size={5}/>}
            disabled={!isEditable}
            onClick={handleCreateCst}
          />
        </div>
      </div>
      <div className='flex items-center w-full gap-1'>
        <Button
          icon={<FilterCogIcon size={7} />}
          dense
          tooltip='Настройки фильтрации узлов и связей'
          widthClass='h-full'
          onClick={() => setShowOptions(true)}
        />
        <ConceptSelect
          className='min-w-[9.3rem]'
          options={GraphColoringSelector}
          searchable={false}
          placeholder='Выберите цвет'
          values={coloringScheme ? [{ value: coloringScheme, label: mapColoringLabels.get(coloringScheme) }] : []}
          onChange={data => { setColoringScheme(data.length > 0 ? data[0].value : GraphColoringSelector[0].value); }}
        />
        
      </div>
      <ConceptSelect
        className='mt-1 w-fit'
        options={GraphLayoutSelector}
        searchable={false}
        placeholder='Выберите тип'
        values={layout ? [{ value: layout, label: mapLayoutLabels.get(layout) }] : []}
        onChange={data => { setLayout(data.length > 0 ? data[0].value : GraphLayoutSelector[0].value); }}
      />
      <Checkbox
        label='Скрыть текст' 
        value={noTerms} 
        onChange={ event => setNoTerms(event.target.checked) }
      />
      <Checkbox
        label='Транзитивная редукция' 
        value={noTransitive} 
        onChange={ event => setNoTransitive(event.target.checked) }
      />
      <Checkbox
        disabled={!is3D}
        label='Анимация вращения' 
        value={orbit} 
        onChange={ event => setOrbit(event.target.checked) }
      />

      <Divider margins='mt-3 mb-2' />

      <div className='flex flex-col overflow-y-auto'>
        <p className='text-center'><b>Скрытые конституенты</b></p>
        <div className='flex flex-wrap justify-center gap-2 py-2'>
        {dismissed.map(cstID => {
          const cst = schema!.items.find(cst => cst.id === cstID)!;
          const adjustedColoring = coloringScheme === 'none' ? 'status': coloringScheme;
          return (<>
            <div
              key={`${cst.alias}`}
              id={`${prefixes.cst_list}${cst.alias}`}
              className='w-fit min-w-[3rem] rounded-md text-center cursor-pointer'
              style={ { backgroundColor: getCstNodeColor(cst, adjustedColoring, darkMode), ...dismissedStyle(cstID) }}
              onClick={() => toggleDismissed(cstID)}
              onDoubleClick={() => onOpenEdit(cstID)}
            >
              {cst.alias}
            </div>
            <ConstituentaTooltip 
              data={cst}
              anchor={`#${prefixes.cst_list}${cst.alias}`}
            />
          </>);
        })}
        </div>
      </div>
    </div>
    <div className='w-full h-full overflow-auto'>
    <div 
      className='relative border-t border-r'
      style={{width: canvasWidth, height: canvasHeight, borderBottomWidth: noNavigation ? '1px': ''}}
    >
      <div className='relative top-0 right-0 z-10 flex mt-1 ml-2 flex-start'>
        <div className='px-1 py-1' id='items-graph-help' >
          <HelpIcon color='text-primary' size={5} />
        </div>
        <MiniButton
          icon={<ArrowsRotateIcon size={5} />}
          tooltip='Пересоздать граф'
          onClick={handleRecreate}
        />
      </div>
      <ConceptTooltip anchorSelect='#items-graph-help'>
        <div className='flex'>
          <div> 
            <h1>Настройка графа</h1>
            <p><b>Цвет</b> - выбор правила покраски узлов</p>
            <p><b>Граф</b> - выбор модели расположения узлов</p>
            <p><b>Удалить несвязанные</b> - скрыть одинокие вершины</p>
            <p><b>Транзитивная редукция</b> - скрыть транзитивные пути</p>

            <Divider margins='mt-2' />
            
            <CstStatusInfo title='Статусы конституент' />
          </div>
          <Divider vertical margins='mx-3' />
          <div>
            <h1>Горячие клавиши</h1>
            <p><b>Клик на конституенту</b> - выделение, включая скрытые конституенты</p>
            <p><b>Довйной клик</b> - редактирование конституенты</p>
            <p><b>Delete</b> - удалить выбранные</p>

            <Divider margins='mt-2' />
            
            <InfoCstClass title='Классы конституент' />
          </div>
        </div>
      </ConceptTooltip>
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
        theme={darkMode ? darkTheme : lightTheme}
        renderNode={({ node, ...rest }) => (
          <Sphere {...rest} node={node} />
        )}
      />
    </div>
    </div>
  </div>);
}


export default EditorTermGraph;
