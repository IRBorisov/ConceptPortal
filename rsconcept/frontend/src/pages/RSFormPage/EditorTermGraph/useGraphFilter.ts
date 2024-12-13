import { useEffect, useState } from 'react';

import { Graph } from '@/models/Graph';
import { GraphFilterParams } from '@/models/miscellaneous';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from '@/models/rsform';

function useGraphFilter(schema: IRSForm | undefined, params: GraphFilterParams, focusCst: IConstituenta | undefined) {
  const [filtered, setFiltered] = useState<Graph>(new Graph());

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

  useEffect(() => {
    if (!schema) {
      setFiltered(new Graph());
      return;
    }
    const graph = schema.graph.clone();
    if (params.noHermits) {
      graph.removeIsolated();
    }
    if (params.noTemplates) {
      schema.items.forEach(cst => {
        if (cst !== focusCst && cst.is_template) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (allowedTypes.length < Object.values(CstType).length) {
      schema.items.forEach(cst => {
        if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (!focusCst && params.foldDerived) {
      schema.items.forEach(cst => {
        if (cst.spawner) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (focusCst) {
      const includes: ConstituentaID[] = [
        focusCst.id,
        ...focusCst.spawn,
        ...(params.focusShowInputs ? schema.graph.expandInputs([focusCst.id]) : []),
        ...(params.focusShowOutputs ? schema.graph.expandOutputs([focusCst.id]) : [])
      ];
      schema.items.forEach(cst => {
        if (!includes.includes(cst.id)) {
          graph.foldNode(cst.id);
        }
      });
    }
    if (params.noTransitive) {
      graph.transitiveReduction();
    }
    setFiltered(graph);
  }, [schema, params, allowedTypes, focusCst]);

  return filtered;
}

export default useGraphFilter;
