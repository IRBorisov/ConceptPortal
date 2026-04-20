import { produceFilteredGraph } from '../../../components/term-graph/graph/tg-models';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useSchemaEdit } from '../schema-edit-context';

export function useFilteredGraph() {
  const { schema, focusCst } = useSchemaEdit();
  const filter = useTermGraphStore(state => state.filter);

  const filteredGraph = produceFilteredGraph(schema, filter, focusCst);
  const hidden = schema.items.filter(cst => !filteredGraph.hasNode(cst.id)).map(cst => cst.id);

  return { filteredGraph, hidden };
}
