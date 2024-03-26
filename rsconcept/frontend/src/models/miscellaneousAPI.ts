/**
 * Module: API for miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */
import { DependencyMode, FontStyle, ILibraryFilter, LibraryFilterStrategy } from './miscellaneous';
import { IConstituenta, IRSForm } from './rsform';

/**
 * Create style name from  {@link FontStyle}.
 */
export function getFontClassName(style: FontStyle): string {
  return `font-${style}`;
}

/**
 * Filter list of  {@link ILibraryItem} to a given graph query.
 */
export function applyGraphFilter(target: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return target.items;
  }
  const ids: number[] | undefined = (() => {
    switch (mode) {
      case DependencyMode.OUTPUTS: {
        return target.graph.nodes.get(start)?.outputs;
      }
      case DependencyMode.INPUTS: {
        return target.graph.nodes.get(start)?.inputs;
      }
      case DependencyMode.EXPAND_OUTPUTS: {
        return target.graph.expandOutputs([start]);
      }
      case DependencyMode.EXPAND_INPUTS: {
        return target.graph.expandInputs([start]);
      }
    }
    return undefined;
  })();
  if (ids) {
    return target.items.filter(cst => ids.find(id => id === cst.id));
  } else {
    return target.items;
  }
}

/**
 * Filter list of  {@link ILibraryItem} to a given text query.
 */
export function filterFromStrategy(strategy: LibraryFilterStrategy): ILibraryFilter {
  // prettier-ignore
  switch (strategy) {
    case LibraryFilterStrategy.MANUAL: return {};
    case LibraryFilterStrategy.COMMON: return { is_common: true };
    case LibraryFilterStrategy.CANONICAL: return { is_canonical: true };
    case LibraryFilterStrategy.PERSONAL: return { is_personal: true };
    case LibraryFilterStrategy.SUBSCRIBE: return { is_subscribed: true };
    case LibraryFilterStrategy.OWNED: return { is_owned: true };
  }
}
