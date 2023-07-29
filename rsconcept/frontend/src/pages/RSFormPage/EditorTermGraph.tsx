import { useMemo, useRef } from 'react';
import Select from 'react-select';
import { GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, useSelection } from 'reagraph';

import GraphThemed from '../../components/Common/GraphThemed';
import { useRSForm } from '../../context/RSFormContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GraphLayoutSelector } from '../../utils/staticUI';

function EditorTermGraph() {
  const { schema } = useRSForm();
  const [ layout, setLayout ] = useLocalStorage<LayoutTypes>('graph_layout', 'forceatlas2');
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
      source.adjacent.forEach(target => {
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

  const { 
    selections, actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    type: 'multi', // 'single' | 'multi' | 'multiModifier'
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: 'all',
    focusOnSelect: 'singleOnly'
  });

  return (
    <div>
    <div className='relative w-full'>
    <div className='absolute top-0 left-0 z-20 px-3 py-2'>
      <Select
        className='w-[10rem]'
        options={GraphLayoutSelector}
        placeholder='Выберите тип'
        value={layout && { value: layout, label: String(layout) }}
        onChange={data => { data && setLayout(data.value); }}
      />
    </div>
    </div>
    <GraphThemed ref={graphRef}
      sizeClass='w-[1240px] h-[800px] 2xl:w-[1880px] 2xl:h-[800px]'
      nodes={nodes}
      edges={edges}
      draggable
      layoutType={layout}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
     // sizingType="default" // 'none' | 'pagerank' | 'centrality' | 'attribute' | 'default';
      cameraMode={ layout.includes('3d') ? 'rotate' : 'pan'}
      />
    </div>
  );
}


export default EditorTermGraph;
