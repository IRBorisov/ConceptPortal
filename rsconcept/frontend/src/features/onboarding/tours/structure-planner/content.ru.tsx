import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Планировщик структуры',
    body: (
      <p>
        <TourHelpLink text='Планировщик структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> строит граф операций по
        типизации открытой конституенты (проекции, сумма множеств и т.д.). Щёлкните узел, чтобы работать с этим
        структурным элементом.
      </p>
    )
  },
  panel: {
    title: 'Определение, терм и сохранение',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Верхняя панель показывает формальное определение выбранного узла, его обозначение (зелёным — если новое) и
          поле терма со ссылками. Для существующих конституент подставляется терм; для пустых — предлагается имя новой.
        </p>
        <p>
          При редактировании <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> сохраняет или создаёт — из поля терма то же делает{' '}
          <kbd>{saveHotkey}</kbd>. <IconReset className='inline-icon icon-primary' /> отменяет несохранённые правки.
        </p>
      </div>
    )
  }
};
