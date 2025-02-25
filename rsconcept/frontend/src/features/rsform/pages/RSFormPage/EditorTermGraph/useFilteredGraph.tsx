import { CstType } from '../../../backend/types';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { type GraphFilterParams, useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

export function useFilteredGraph() {
  const { schema, focusCst } = useRSEdit();
  const filter = useTermGraphStore(state => state.filter);

  const filteredGraph = produceFilteredGraph(schema, filter, focusCst);
  const hidden = schema.items.filter(cst => !filteredGraph.hasNode(cst.id)).map(cst => cst.id);

  return { filteredGraph, hidden };
}

// ====== Internals =========
function produceFilteredGraph(schema: IRSForm, params: GraphFilterParams, focusCst: IConstituenta | null) {
  const filtered = schema.graph.clone();
  const allowedTypes: CstType[] = (() => {
    const result: CstType[] = [];
    if (params.allowBase) result.push(CstType.BASE);
    if (params.allowStruct) result.push(CstType.STRUCTURED);
    if (params.allowTerm) result.push(CstType.TERM);
    if (params.allowAxiom) result.push(CstType.AXIOM);
    if (params.allowFunction) result.push(CstType.FUNCTION);
    if (params.allowPredicate) result.push(CstType.PREDICATE);
    if (params.allowConstant) result.push(CstType.CONSTANT);
    if (params.allowTheorem) result.push(CstType.THEOREM);
    return result;
  })();

  if (params.noHermits) {
    filtered.removeIsolated();
  }
  if (params.noTemplates) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && cst.is_template) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (allowedTypes.length < Object.values(CstType).length) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (!focusCst && params.foldDerived) {
    schema.items.forEach(cst => {
      if (cst.spawner) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (focusCst) {
    const includes: number[] = [
      focusCst.id,
      ...focusCst.spawn,
      ...(params.focusShowInputs ? schema.graph.expandInputs([focusCst.id]) : []),
      ...(params.focusShowOutputs ? schema.graph.expandOutputs([focusCst.id]) : [])
    ];
    schema.items.forEach(cst => {
      if (!includes.includes(cst.id)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (params.noTransitive) {
    filtered.transitiveReduction();
  }

  return filtered;
}
