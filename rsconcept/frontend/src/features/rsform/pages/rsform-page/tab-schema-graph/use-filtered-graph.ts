import { useMemo } from 'react';

import { produceFilteredGraph } from '../../../components/term-graph/graph/tg-models';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useSchemaEdit } from '../schema-edit-context';

export function useFilteredGraph() {
  const { schema, focusCst } = useSchemaEdit();
  const filter = useTermGraphStore(state => state.filter);

  const filteredGraph = useMemo(() => produceFilteredGraph(schema, filter, focusCst), [schema, filter, focusCst]);
  const hidden = useMemo(
    () => schema.items.filter(cst => !filteredGraph.hasNode(cst.id)).map(cst => cst.id),
    [schema.items, filteredGraph]
  );

  return { filteredGraph, hidden };
}
