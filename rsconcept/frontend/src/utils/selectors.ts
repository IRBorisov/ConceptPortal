/**
 * Module: Mappings for selector UI elements.
 */
import { LayoutTypes } from 'reagraph';

import { type GramData, Grammeme, ReferenceType } from '@/models/language';
import { grammemeCompare } from '@/models/languageAPI';
import { GraphColoringScheme } from '@/models/miscelanious';
import { CstType } from '@/models/rsform';

import { labelGrammeme, labelReferenceType } from './labels';
import { labelCstType } from './labels';

/**
 * Represents options for GraphLayout selector.
*/
export const SelectorGraphLayout: { value: LayoutTypes, label: string }[] = [
  { value: 'treeTd2d', label: 'Граф: ДеревоВ 2D' },
  { value: 'treeTd3d', label: 'Граф: ДеревоВ 3D' },
  { value: 'forceatlas2', label: 'Граф: Атлас 2D' },
  { value: 'forceDirected2d', label: 'Граф: Силы 2D' },
  { value: 'forceDirected3d', label: 'Граф: Силы 3D' },
  { value: 'treeLr2d', label: 'Граф: ДеревоГ 2D' },
  { value: 'treeLr3d', label: 'Граф: ДеревоГ 3D' },
  { value: 'radialOut2d', label: 'Граф: Радиальная 2D' },
  { value: 'radialOut3d', label: 'Граф: Радиальная 3D' },
  // { value: 'circular2d', label: 'circular2d'},
  //  { value: 'nooverlap', label: 'nooverlap'},
  //  { value: 'hierarchicalTd', label: 'hierarchicalTd'},
  //  { value: 'hierarchicalLr', label: 'hierarchicalLr'}
];

/**
 * Represents options for {@link GraphColoringScheme} selector.
*/
export const SelectorGraphColoring: { value: GraphColoringScheme, label: string }[] = [
  { value: 'none', label: 'Цвет: моно' },
  { value: 'status', label: 'Цвет: статус' },
  { value: 'type', label: 'Цвет: класс' },
];

/**
 * Represents options for {@link CstType} selector.
*/
export const SelectorCstType = (
  Object.values(CstType)).map(
  typeStr => ({
    value: typeStr as CstType,
    label: labelCstType(typeStr as CstType)
  })
);

/**
 * Represents single option for {@link Grammeme} selector.
*/
export interface IGrammemeOption {
  value: GramData
  label: string
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
export const SelectorGrammemesList = [
  Grammeme.sing, Grammeme.plur,
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct,
];

/**
 * Represents options for {@link Grammeme} selector.
*/
export const SelectorGrammems: IGrammemeOption[] = 
SelectorGrammemesList.map(
gram => ({
  value: gram,
  label: labelGrammeme(gram)
}));

/**
 * Represents options for {@link ReferenceType} selector.
*/
export const SelectorReferenceType = (
  Object.values(ReferenceType)).map(
  typeStr => ({
    value: typeStr as ReferenceType,
    label: labelReferenceType(typeStr as ReferenceType)
  })
);

/**
 * Represents recommended wordforms data.
*/
export const PremadeWordForms = [
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