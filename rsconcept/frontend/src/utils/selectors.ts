// Module: Selector maps
import { LayoutTypes } from 'reagraph';

import { CstType } from '../models/rsform';
import { ColoringScheme } from '../pages/RSFormPage/EditorTermGraph';
import { getCstTypeLabel } from './staticUI';


export const SelectorGraphLayout: { value: LayoutTypes; label: string; }[] = [
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

export const SelectorGraphColoring: { value: ColoringScheme; label: string; }[] = [
  { value: 'none', label: 'Цвет: моно' },
  { value: 'status', label: 'Цвет: статус' },
  { value: 'type', label: 'Цвет: класс' },
];

export const SelectorCstType = (
  Object.values(CstType)).map(
    typeStr => ({
      value: typeStr as CstType,
      label: getCstTypeLabel(typeStr as CstType)
    })
  );

