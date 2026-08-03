import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Раскрытие структуры',
    body: (
      <>
        <p>
          <TourHelpLink text='Раскрытие структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> показывает граф операций по
          типизации выбранной конституенты (проекции, множество-сумма и т.д.). Для порождённой конституенты корень —
          структура основания.
        </p>
        <p>
          В круге узла — имя, под ним — терм или тип. Цвет: фиолетовый — корень, зелёный — конституента уже есть,
          оранжевый — нужно создать. Щёлкните узел, чтобы выбрать структурный элемент.
        </p>
      </>
    )
  },
  panel: {
    title: 'Определение, терм и сохранение',
    body: (
      <>
        <p>
          Верхняя панель показывает формальное определение выбранного узла, его имя (сокращение) — зелёным, если новое —
          и поле терма с текстовыми отсылками. Для существующей конституенты подставляется сохранённый терм; для нового
          узла имя назначается автоматически, а в поле вводится термин.
        </p>
        <p>
          Если редактирование разрешено, <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> сохраняет или создаёт — из поля терма то же делает{' '}
          <kbd>{saveHotkey}</kbd>. <IconReset className='inline-icon icon-primary' /> сбрасывает правки терма только у
          существующей конституенты. При смене узла с несохранёнными правками появится запрос.
        </p>
      </>
    )
  }
};
