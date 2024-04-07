/**
 * Module: Mappings for selector UI elements. Do not confuse with html selectors
 */

import { GraphLayout } from '@/components/ui/GraphUI';
import { type GramData, Grammeme, ReferenceType } from '@/models/language';
import { grammemeCompare } from '@/models/languageAPI';
import { GraphColoring, GraphSizing } from '@/models/miscellaneous';
import { CstType } from '@/models/rsform';

import { labelGrammeme, labelReferenceType, mapLabelColoring, mapLabelLayout, mapLabelSizing } from './labels';
import { labelCstType } from './labels';

/**
 * Represents options for GraphLayout selector.
 */
export const SelectorGraphLayout: { value: GraphLayout; label: string }[] = //
  [...mapLabelLayout.entries()].map(item => ({ value: item[0], label: item[1] }));
/**
 * Represents options for {@link GraphColoring} selector.
 */
export const SelectorGraphColoring: { value: GraphColoring; label: string }[] = //
  [...mapLabelColoring.entries()].map(item => ({ value: item[0], label: item[1] }));

/**
 * Represents options for {@link GraphSizing} selector.
 */
export const SelectorGraphSizing: { value: GraphSizing; label: string }[] = //
  [...mapLabelSizing.entries()].map(item => ({ value: item[0], label: item[1] }));

/**
 * Represents options for {@link CstType} selector.
 */
export const SelectorCstType = Object.values(CstType).map(typeStr => ({
  value: typeStr as CstType,
  label: labelCstType(typeStr as CstType)
}));

/**
 * Represents single option for {@link Grammeme} selector.
 */
export interface IGrammemeOption {
  value: GramData;
  label: string;
}

/**
 * Compares {@link IGrammemeOption} based on Grammeme comparison.
 */
export function compareGrammemeOptions(left: IGrammemeOption, right: IGrammemeOption): number {
  return grammemeCompare(left.value, right.value);
}

/**
 * Represents list of {@link Grammeme}s available in reference construction.
 */
// prettier-ignore
export const SelectorGrammemesList = [
  Grammeme.sing, Grammeme.plur,
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct,
];

/**
 * Represents options for {@link Grammeme} selector.
 */
export const SelectorGrammemes: IGrammemeOption[] = SelectorGrammemesList.map(gram => ({
  value: gram,
  label: labelGrammeme(gram)
}));

/**
 * Represents options for {@link ReferenceType} selector.
 */
export const SelectorReferenceType = Object.values(ReferenceType).map(typeStr => ({
  value: typeStr as ReferenceType,
  label: labelReferenceType(typeStr as ReferenceType)
}));

/**
 * Represents recommended wordforms data.
 */
export const DefaultWordForms = [
  { text: 'ед им', example: 'ручка', grams: [Grammeme.sing, Grammeme.nomn] },
  { text: 'ед род', example: 'ручки', grams: [Grammeme.sing, Grammeme.gent] },
  { text: 'ед дат', example: 'ручке', grams: [Grammeme.sing, Grammeme.datv] },
  { text: 'ед вин', example: 'ручку', grams: [Grammeme.sing, Grammeme.accs] },
  { text: 'ед твор', example: 'ручкой', grams: [Grammeme.sing, Grammeme.ablt] },
  { text: 'ед пред', example: 'ручке', grams: [Grammeme.sing, Grammeme.loct] },

  { text: 'мн им', example: 'ручки', grams: [Grammeme.plur, Grammeme.nomn] },
  { text: 'мн род', example: 'ручек', grams: [Grammeme.plur, Grammeme.gent] },
  { text: 'мн дат', example: 'ручкам', grams: [Grammeme.plur, Grammeme.datv] },
  { text: 'мн вин', example: 'ручки', grams: [Grammeme.plur, Grammeme.accs] },
  { text: 'мн твор', example: 'ручками', grams: [Grammeme.plur, Grammeme.ablt] },
  { text: 'мн пред', example: 'ручках', grams: [Grammeme.plur, Grammeme.loct] }
];
