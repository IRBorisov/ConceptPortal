/**
 * Module: API for miscellanious frontend model types. Future tagets for refactoring aimed at extracting modules.
 */
import { DependencyMode } from './miscelanious';
import { IConstituenta, IRSForm } from './rsform';


/**
 * Filter list of  {@link ILibraryItem} to a given query.
 */
export function applyGraphFilter(target: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return target.items
  }
  let ids: number[] | undefined = undefined
  switch (mode) {
    case DependencyMode.OUTPUTS: { ids = target.graph.nodes.get(start)?.outputs; break} 
    case DependencyMode.INPUTS: { ids = target.graph.nodes.get(start)?.inputs; break} 
    case DependencyMode.EXPAND_OUTPUTS: { ids = target.graph.expandOutputs([start]); break} 
    case DependencyMode.EXPAND_INPUTS: { ids = target.graph.expandInputs([start]); break} 
  }
  if (!ids) {
    return target.items
  } else {
    return target.items.filter(cst => ids!.find(id => id === cst.id))
  }
}