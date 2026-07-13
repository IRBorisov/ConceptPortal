import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconSearch
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const constituentsListContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Список конституент',
    body: (
      <p>
        Конституенты — строительные блоки схемы: базисные множества, термины, определения и аксиомы. На вкладке{' '}
        <TourHelpLink text='список' topic={HelpTopic.UI_MODEL_LIST} /> они собраны в одной таблице — со статусом
        вычисления, если к схеме привязана модель.
      </p>
    )
  },
  filter: {
    title: 'Поиск',
    body: (
      <p>
        Строка <IconSearch className='inline-icon' /> поиска находит конституенты по имени, термину или тексту
        определения. Подробнее — в руководстве по{' '}
        <TourHelpLink text='списку конституент' topic={HelpTopic.UI_SCHEMA_LIST} />.
      </p>
    )
  },
  selection: {
    title: 'Счётчик выделения',
    body: (
      <p>
        Счётчик слева показывает, сколько конституент выделено из общего числа. Щелчок по строке выделяет;{' '}
        <kbd>Esc</kbd> снимает выделение.
      </p>
    )
  },
  toolbar: {
    title: 'Панель списка',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconNewItem className='inline-icon icon-green' /> создать, <IconClone className='inline-icon icon-green' />{' '}
          клонировать и <IconDestroy className='inline-icon icon-red' /> удалить выбранные.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> меняют порядок;{' '}
          <IconCrucial className='inline-icon' /> отмечает ключевые конституенты.
        </p>
        <p>
          В модели <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает все
          значения.
        </p>
      </div>
    )
  },
  interact: {
    title: 'Работа с таблицей',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <kbd>Shift</kbd>+щелчок расширяет выделение. Двойной щелчок или щелчок с <kbd>Alt</kbd> открывает
          конституенту в <TourHelpLink text='редакторе' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Перетаскивайте строки, чтобы изменить порядок в схеме. При активном поиске перестановка отключена — очистите
          строку поиска, если нужно переместить элементы.
        </p>
      </div>
    )
  }
};
