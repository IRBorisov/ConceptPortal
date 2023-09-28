// Module: Selector maps
import { LayoutTypes } from 'reagraph';

import { compareGrammemes,type GramData, Grammeme } from '../models/language';
import { CstType } from '../models/rsform';
import { ColoringScheme } from '../pages/RSFormPage/EditorTermGraph';
import { labelGrammeme } from './labels';
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
 * Represents options for {@link ColoringScheme} selector.
*/
export const SelectorGraphColoring: { value: ColoringScheme, label: string }[] = [
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
  return compareGrammemes(left.value, right.value);
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
