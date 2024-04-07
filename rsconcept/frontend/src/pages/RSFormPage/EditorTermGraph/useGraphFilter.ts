import { useLayoutEffect, useMemo, useState } from 'react';

import { Graph } from '@/models/Graph';
import { GraphFilterParams } from '@/models/miscellaneous';
import { CstType, IRSForm } from '@/models/rsform';

function useGraphFilter(schema: IRSForm | undefined, params: GraphFilterParams) {
  const [filtered, setFiltered] = useState<Graph>(new Graph());

  const allowedTypes: CstType[] = useMemo(() => {
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
  }, [params]);

  useLayoutEffect(() => {
    if (!schema) {
      setFiltered(new Graph());
      return;
    }
    const graph = schema.graph.clone();
    if (params.noHermits) {
      graph.removeIsolated();
    }
    if (params.noTransitive) {
      graph.transitiveReduction();
    }
    if (params.noTemplates) {
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
    if (params.foldDerived) {
      schema.items.forEach(cst => {
        if (cst.parent_alias) {
          graph.foldNode(cst.id);
        }
      });
    }
    setFiltered(graph);
  }, [schema, params, allowedTypes]);

  return filtered;
}

export default useGraphFilter;
