import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { darkTheme, GraphCanvas, GraphCanvasRef, GraphEdge, 
  GraphNode, LayoutTypes, lightTheme, Sphere, useSelection
} from 'reagraph';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import ConceptSelect from '../../components/Common/ConceptSelect';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Divider from '../../components/Common/Divider';
import ConstituentaInfo from '../../components/Help/ConstituentaInfo';
import CstStatusInfo from '../../components/Help/CstStatusInfo';
import { ArrowsRotateIcon, HelpIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { prefixes, resources } from '../../utils/constants';
import { Graph } from '../../utils/Graph';
import { IConstituenta } from '../../utils/models';
import { getCstStatusColor, getCstTypeColor, 
  GraphColoringSelector, GraphLayoutSelector,
  mapColoringLabels, mapLayoutLabels, mapStatusInfo
} from '../../utils/staticUI';
import ConstituentaTooltip from './elements/ConstituentaTooltip';

export type ColoringScheme = 'none' | 'status' | 'type';
const TREE_SIZE_MILESTONE = 50;

function getCstNodeColor(cst: IConstituenta, coloringScheme: ColoringScheme, darkMode: boolean): string {
  if (coloringScheme === 'type') {
    return getCstTypeColor(cst.cstType, darkMode);
  }
  if (coloringScheme === 'status') {
    return getCstStatusColor(cst.status, darkMode);
  }
  return '';
}

interface EditorTermGraphProps {
  onOpenEdit: (cstID: number) => void
 // onCreateCst: (selectedID: number | undefined, type: CstType | undefined, skipDialog?: boolean) => void
 // onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
}

function EditorTermGraph({ onOpenEdit }: EditorTermGraphProps) {
  const { schema } = useRSForm();
  const { darkMode, noNavigation } = useConceptTheme();
  
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'treeTd2d');
  const [ coloringScheme, setColoringScheme ] = useLocalStorage<ColoringScheme>('graph_coloring', 'none');
  const [ orbit, setOrbit ] = useState(false);
  const [ noHermits, setNoHermits ] = useLocalStorage('graph_no_hermits', true);
  const [ noTransitive, setNoTransitive ] = useLocalStorage('graph_no_transitive', false);
  
  const [ filtered, setFiltered ] = useState<Graph>(new Graph());
  const [ dismissed, setDismissed ] = useState<number[]>([]);
  const [ selectedDismissed, setSelectedDismissed ] = useState<number[]>([]);
  const graphRef = useRef<GraphCanvasRef | null>(null);
  
  const [hoverID, setHoverID] = useState<string | undefined>(undefined);
  const hoverCst = useMemo(
  () => {
    return schema?.items.find(cst => String(cst.id) == hoverID);
  }, [schema?.items, hoverID]);

  const is3D = useMemo(() => layout.includes('3d'), [layout]);

  useEffect(
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
  }, [schema, noHermits, noTransitive]);

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
          label: cst.term.resolved ? `${cst.alias}: ${cst.term.resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [schema, coloringScheme, filtered.nodes, darkMode]);

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
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    type: 'multi', // 'single' | 'multi' | 'multiModifier'
    pathSelectionType: 'all',
    focusOnSelect: false
  });

  const handleCenter = useCallback(
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
    <div className='flex justify-between w-full'>
    <div className='flex flex-col py-2 border-t border-r w-[14.7rem] pr-2 text-sm' style={{height: canvasHeight}}>
      {hoverCst && 
      <div className='relative'>
        <ConstituentaInfo 
          data={hoverCst}
          className='absolute top-0 left-0 z-50 w-[25rem] min-h-[11rem] overflow-y-auto border h-fit clr-app px-3' 
        />
      </div>}
      <div className='flex items-center w-full gap-1'>
        <Button
          icon={<ArrowsRotateIcon size={7} />}
          dense
          tooltip='Центрировать изображение'
          widthClass='h-full'
          onClick={handleCenter}
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
        disabled={!is3D}
        label='Анимация вращения' 
        value={orbit} 
        onChange={ event => setOrbit(event.target.checked) }
      />
      <Checkbox
        label='Удалить несвязанные' 
        value={noHermits} 
        onChange={ event => setNoHermits(event.target.checked) }
      />
      <Checkbox
        label='Транзитивная редукция' 
        value={noTransitive} 
        onChange={ event => setNoTransitive(event.target.checked) }
      />

      <Divider margins='mt-3 mb-2' />

      <div className='flex flex-col overflow-y-auto'>
        <p className='text-center'><b>Скрытые конституенты</b></p>
        <div className='flex flex-wrap justify-center gap-2 py-2'>
        {dismissed.map(cstID => {
          const cst = schema!.items.find(cst => cst.id === cstID)!;
          const info = mapStatusInfo.get(cst.status)!;
          return (<>
            <div
              key={`${cst.alias}`}
              id={`${prefixes.cst_list}${cst.alias}`}
              className={`w-fit min-w-[3rem] rounded-md text-center cursor-pointer ${info.color}`}
              style={dismissedStyle(cstID)}
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
    <div className='flex-wrap w-full h-full overflow-auto'>
    <div 
      className='relative border-t border-r'
      style={{width: canvasWidth, height: canvasHeight, borderBottomWidth: noNavigation ? '1px': ''}}
    >
      <div id='items-graph-help' className='relative top-0 right-0 z-10 m-2'>
        <HelpIcon color='text-primary' size={6} />
      </div>
      <ConceptTooltip anchorSelect='#items-graph-help'>
        <div>
          <h1>Настройка графа</h1>
          <p><b>Цвет</b> - выбор правила покраски узлов</p>
          <p><i>Скрытые конституенты окрашены в цвет статуса</i></p>
          <p><b>Граф</b> - выбор модели расположения узлов</p>
          <p><b>Удалить несвязанные</b> - в графе не отображаются одинокие вершины</p>
          <p><b>Транзитивная редукция</b> - в графе устраняются транзитивные пути</p>

          <Divider margins='mt-2' />

          <h1>Горячие клавиши</h1>
          <p><b>Двойной клик</b> - редактирование конституенты</p>
          <p><b>Delete</b> - удаление конституент</p>
          <p><b>Alt + 1-6,Q,W</b> - добавление конституент</p>

          <Divider margins='mt-2' />
          
          <CstStatusInfo title='Статусы' />
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
        onCanvasClick={onCanvasClick}
        onNodePointerOver={handleHoverIn}
        onNodePointerOut={handleHoverOut}
        cameraMode={ orbit ? 'orbit' : is3D ? 'rotate' : 'pan'}
        layoutOverrides={ 
          layout.includes('tree') ? { nodeLevelRatio: schema && schema?.items.length < TREE_SIZE_MILESTONE ? 3 : 1 } 
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
