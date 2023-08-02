import { useCallback, useMemo, useRef, useState } from 'react';
import { darkTheme, GraphCanvas, GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, lightTheme, useSelection } from 'reagraph';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import ConceptSelect from '../../components/Common/ConceptSelect';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { resources } from '../../utils/constants';
import { GraphLayoutSelector,mapLayoutLabels } from '../../utils/staticUI';

function EditorTermGraph() {
  const { schema } = useRSForm();
  const { darkMode } = useConceptTheme();
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'forceatlas2');
  const [ orbit, setOrbit ] = useState(false);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const nodes: GraphNode[] = useMemo(() => {
    return schema?.items.map(cst => { 
      return {
        id: String(cst.id),
        label: (cst.term.resolved || cst.term.raw) ? `${cst.alias}: ${cst.term.resolved || cst.term.raw}` : cst.alias
      }}
    ) ?? [];
  }, [schema?.items]);

  const edges: GraphEdge[] = useMemo(() => {
    const result: GraphEdge[] = [];
    let edgeID = 1;
    schema?.graph.nodes.forEach(source => {
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
  }, [schema?.graph]);

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

  return (<>
    <div className='relative w-full'>
    <div className='absolute top-0 left-0 z-20 px-3 py-2 w-[12rem] flex flex-col gap-2'>
      <ConceptSelect
        options={GraphLayoutSelector}
        placeholder='Выберите тип'
        values={layout ? [{ value: layout, label: mapLayoutLabels.get(layout) }] : []}
        onChange={data => { setLayout(data.length > 0 ? data[0].value : GraphLayoutSelector[0].value); }}
      />
      <Checkbox
        label='Анимация вращения' 
        widthClass='w-full'
        value={orbit} 
        onChange={ event => setOrbit(event.target.checked) }/>
      <Button
        text='Центрировать'
        dense
        onClick={handleCenter}
      />
    </div>
    </div>
    <div className='flex-wrap w-full h-full overflow-auto'>
    <div className='relative w-[1240px] h-[800px] 2xl:w-[1880px] 2xl:h-[800px]'>
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
        layoutOverrides={ layout.includes('tree') ? { nodeLevelRatio: 1 } : undefined }
        labelFontUrl={resources.graph_font}
        theme={darkMode ? darkTheme : lightTheme}
      />
    </div>
    </div>
  </>);
}


export default EditorTermGraph;
