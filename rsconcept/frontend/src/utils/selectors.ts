// Module: Selector maps
import { LayoutTypes } from 'reagraph';

import { Grammeme } from '../models/language';
import { CstType } from '../models/rsform';
import { ColoringScheme } from '../pages/RSFormPage/EditorTermGraph';
import { getCstTypeLabel } from './staticUI';


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
      label: getCstTypeLabel(typeStr as CstType)
    })
  );

export const SelectorGrammems: { value: Grammeme, label: string }[] = [
  { value: Grammeme.sing, label: 'Число: един' },
  { value: Grammeme.plur, label: 'Число: множ' },

  { value: Grammeme.nomn, label: 'Падеж: имен' },
  { value: Grammeme.gent, label: 'Падеж: род' },
  { value: Grammeme.datv, label: 'Падеж: дат' },
  { value: Grammeme.accs, label: 'Падеж: вин' },
  { value: Grammeme.ablt, label: 'Падеж: твор' },
  { value: Grammeme.loct, label: 'Падеж: пред' },

  { value: Grammeme.NOUN, label: 'ЧР: сущ' },
  { value: Grammeme.VERB, label: 'ЧР: глагол' },
  { value: Grammeme.INFN, label: 'ЧР: глагол инф' },
  { value: Grammeme.ADJF, label: 'ЧР: прил' },
  { value: Grammeme.ADJS, label: 'ЧР: кр прил' },
  { value: Grammeme.PRTF, label: 'ЧР: прич' },
  { value: Grammeme.PRTS, label: 'ЧР: кр прич' },  

  { value: Grammeme.perf, label: 'Совершенный: да' },
  { value: Grammeme.impf, label: 'Совершенный: нет' },

  { value: Grammeme.tran, label: 'Переходный: да' },
  { value: Grammeme.intr, label: 'Переходный: нет' },

  { value: Grammeme.pres, label: 'Время: наст' },
  { value: Grammeme.past, label: 'Время: прош' },
  { value: Grammeme.futr, label: 'Время: буд' },

  { value: Grammeme.per1, label: 'Лицо: 1' },
  { value: Grammeme.per2, label: 'Лицо: 2' },
  { value: Grammeme.per3, label: 'Лицо: 3' },

  { value: Grammeme.impr, label: 'Повелительный: да' },
  { value: Grammeme.indc, label: 'Повелительный: нет' },

  { value: Grammeme.incl, label: 'Включающий: да' },
  { value: Grammeme.excl, label: 'Включающий: нет' },

  { value: Grammeme.pssv, label: 'Страдательный: да' },
  { value: Grammeme.actv, label: 'Страдательный: нет' },
];

// { value: Grammeme.masc, label: 'Род: муж' },
// { value: Grammeme.femn, label: 'Род: жен' },
// { value: Grammeme.neut, label: 'Род: ср' },