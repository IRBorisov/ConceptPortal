import { type ConstituentaBasicsDTO } from '@/features/rsform/backend/types';
import { applyAliasMapping } from '@/features/rslang/api';

export function applyMappingToConstituents(
  items: ConstituentaBasicsDTO[],
  mapping: Record<string, string>,
  changeAliases: boolean
): void {
  for (const cst of items) {
    if (changeAliases && cst.alias in mapping) {
      cst.alias = mapping[cst.alias];
    }
    cst.definition_formal = applyAliasMapping(cst.definition_formal, mapping);
    cst.term_raw = replaceEntities(cst.term_raw, mapping);
    cst.definition_raw = replaceEntities(cst.definition_raw, mapping);
  }
}

// ====== Internals ======

function replaceEntities(text: string, mapping: Record<string, string>): string {
  if (text === '') {
    return text;
  }

  const pattern = /@{([^0-9\-].*?)\|.*?}/g;
  let posInput = 0;
  let output = '';
  for (const segment of text.matchAll(pattern)) {
    const entity = segment[1];
    const start = segment.index ?? 0;
    if (entity in mapping) {
      output += text.substring(posInput, start + 2);
      output += mapping[entity];
      output += text.substring(start + 2 + entity.length, start + segment[0].length);
      posInput = start + segment[0].length;
    }
  }
  output += text.substring(posInput, text.length);
  return output;
}
