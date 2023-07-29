import { useMemo } from 'react';
import { darkTheme, GraphCanvas, GraphEdge, GraphNode, lightTheme } from 'reagraph';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { resources } from '../../utils/constants';

function EditorTermGraph() {
  const { schema } = useRSForm();
  const { darkMode } = useConceptTheme();

  const nodes: GraphNode[] = useMemo(() => {
    return schema?.items.map(cst => { 
      return {
        id: String(cst.id),
        label: (cst.term.resolved || cst.term.raw) ? `${cst.alias}: ${cst.term.resolved || cst.term.raw}` : cst.alias
      }}
    ) ?? [];
  }, [schema?.items]);

  const edges = useMemo(() => {
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

  return (
    <div className='flex-wrap w-full h-full overflow-auto'>
      <div className='relative border w-[1240px] h-[800px] 2xl:w-[1880px] 2xl:h-[800px]'>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        draggable
        theme={darkMode ? darkTheme : lightTheme}
        labelFontUrl={resources.graph_font}
      />
      </div>
    </div>
  );
}


export default EditorTermGraph;
