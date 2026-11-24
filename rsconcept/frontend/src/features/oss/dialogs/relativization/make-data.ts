import { RSLangAnalyzer, TokenID, TypeID } from '@rsconcept/domain/rslang';
import { extractGlobals, parseRSLangExpression } from '@rsconcept/domain/rslang/api';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { type RSFormDTO } from '@/features/rsform';

import { createRelativizer } from './relativizer.mjs';

const relativizer = createRelativizer({
  RSLangAnalyzer,
  TokenID,
  TypeID,
  labelType,
  parseRSLangExpression,
  extractGlobals
});

export function makeRelativizedData(
  source: Pick<RSFormDTO, 'items' | 'attribution'>,
  target: string,
  ignored: string[]
) {
  const input = source.items.map(item => ({
    entityUID: item.id,
    type: 'constituenta',
    cstType: item.cst_type,
    alias: item.alias,
    convention: item.convention,
    crucial: item.crucial,
    valueIsProperty: item.value_is_property,
    term: { raw: item.term_raw, forms: item.term_forms },
    definition: {
      formal: item.definition_formal,
      typification_manual: item.typification_manual,
      text: { raw: item.definition_raw }
    }
  }));
  const result = relativizer.transform(relativizer.prepare(input), {
    target,
    ignored
  });
  if (!result) {
    return null;
  }

  return {
    items: result.items.map(item => ({
      id: item.entityUID,
      alias: item.alias,
      cst_type: item.cstType,
      convention: item.convention ?? '',
      crucial: item.crucial ?? false,
      value_is_property: item.valueIsProperty ?? false,
      definition_formal: item.definition.formal,
      typification_manual: item.definition.typification_manual ?? '',
      definition_raw: item.definition.text?.raw ?? '',
      definition_resolved: '',
      term_raw: item.term?.raw ?? '',
      term_resolved: '',
      term_forms: item.term?.forms ?? []
    })),
    attribution: source.attribution
  };
}
