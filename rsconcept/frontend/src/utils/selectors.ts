// Module: Selector maps
import { LayoutTypes } from 'reagraph';

import { Grammeme, IGramData } from '../models/language';
import { CstType } from '../models/rsform';
import { ColoringScheme } from '../pages/RSFormPage/EditorTermGraph';
import { labelGrammeme } from './labels';
import { labelCstType } from './labels';


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

export const SelectorGraphColoring: { value: ColoringScheme, label: string }[] = [
  { value: 'none', label: 'Цвет: моно' },
  { value: 'status', label: 'Цвет: статус' },
  { value: 'type', label: 'Цвет: класс' },
];

export const SelectorCstType = (
  Object.values(CstType)).map(
  typeStr => ({
    value: typeStr as CstType,
    label: labelCstType(typeStr as CstType)
  })
);

export interface IGrammemeOption extends IGramData {
  value: Grammeme
  label: string
}

export const SelectorGrammems: IGrammemeOption[] = 
[
  Grammeme.NOUN, Grammeme.VERB,

  Grammeme.sing, Grammeme.plur,
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct,

  Grammeme.INFN, Grammeme.ADJF, Grammeme.PRTF,
  Grammeme.ADJS, Grammeme.PRTS,

  Grammeme.perf, Grammeme.impf,
  Grammeme.tran, Grammeme.intr,
  Grammeme.pres, Grammeme.past, Grammeme.futr,
  Grammeme.per1, Grammeme.per2, Grammeme.per3,
  Grammeme.impr, Grammeme.indc,
  Grammeme.incl, Grammeme.excl,
  Grammeme.pssv, Grammeme.actv,
].map(
gram => ({
  type: gram,
  data: gram as string,
  value: gram,
  label: labelGrammeme({type: gram, data: ''} as IGramData)
}));
