import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { darkTheme, GraphCanvas, GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, lightTheme, Sphere, useSelection } from 'reagraph';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import ConceptSelect from '../../components/Common/ConceptSelect';
import { ArrowsRotateIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { resources } from '../../utils/constants';
import { Graph } from '../../utils/Graph';
import { GraphLayoutSelector,mapLayoutLabels } from '../../utils/staticUI';

function EditorTermGraph() {
  const { schema } = useRSForm();
  const { darkMode, noNavigation } = useConceptTheme();
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'forceatlas2');

  const [ filtered, setFiltered ] = useState<Graph>(new Graph());
  const [ orbit, setOrbit ] = useState(false);
  const [ noHermits, setNoHermits ] = useLocalStorage('graph_no_hermits', true);
  const [ noTransitive, setNoTransitive ] = useLocalStorage('graph_no_transitive', false);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  useEffect(() => {
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
    setFiltered(graph);
  }, [schema, noHermits, noTransitive]);

  const nodes: GraphNode[] = useMemo(() => {
    const result: GraphNode[] = [];
    if (!schema) {
      return result;
    }
    filtered.nodes.forEach(node => {
      const cst = schema.items.find(cst => cst.id === node.id);
      if (cst) {
        result.push({
          id: String(node.id),
          label: cst.term.resolved ? `${cst.alias}: ${cst.term.resolved}` : cst.alias
        });
      }
    });
    return result;
  }, [schema, filtered.nodes]);

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

  const handleCenter = useCallback(() => {
    graphRef.current?.resetControls();
    graphRef.current?.centerGraph();
  }, []);

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

  const canvasSize = !noNavigation ? 
    'w-[1240px] h-[736px] 2xl:w-[1880px] 2xl:h-[746px]' 
  : 'w-[1240px] h-[800px] 2xl:w-[1880px] 2xl:h-[810px]';

  return (<>
    <div className='relative w-full'>
    <div className='absolute top-0 left-0 z-20 py-2 w-[12rem] flex flex-col'>
      <div className='flex items-center gap-1 w-[15rem]'>
        <Button
          icon={<ArrowsRotateIcon size={8} />}
          dense
          tooltip='Центрировать изображение'
          widthClass='h-full'
          onClick={handleCenter}
        />
        <ConceptSelect
          options={GraphLayoutSelector}
          placeholder='Выберите тип'
          values={layout ? [{ value: layout, label: mapLayoutLabels.get(layout) }] : []}
          onChange={data => { setLayout(data.length > 0 ? data[0].value : GraphLayoutSelector[0].value); }}
        />
      </div>
      <Checkbox
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
    </div>
    </div>
    <div className='flex-wrap w-full h-full overflow-auto'>
    <div className={`relative border-t border-r ${canvasSize}`}>
      <GraphCanvas
        draggable
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        layoutType={layout}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        defaultNodeSize={5}
        onNodePointerOver={onNodePointerOver}
        onNodePointerOut={onNodePointerOut}
        cameraMode={ orbit ? 'orbit' : layout.includes('3d') ? 'rotate' : 'pan'}
        layoutOverrides={ layout.includes('tree') ? { nodeLevelRatio: schema && schema?.items.length < 50 ? 3 : 1 } : undefined }
        labelFontUrl={resources.graph_font}
        theme={darkMode ? darkTheme : lightTheme}
        renderNode={({ node, ...rest }) => (
          <Sphere {...rest} node={node} />
        )}
      />
    </div>
    </div>
  </>);
}


export default EditorTermGraph;
