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
        Конституенты — части концептуальной схемы: неопределяемые понятия, термы, функции, аксиомы, высказывания и др.
        На вкладке <TourHelpLink text='список' topic={HelpTopic.UI_MODEL_LIST} /> они собраны в таблице; если открыта
        модель — ещё статус вычисления.
      </p>
    )
  },
  filter: {
    title: 'Поиск',
    body: (
      <>
        <p>
          Попробуйте: введите текст в строку <IconSearch className='inline-icon' /> поиска. Список отфильтруется по
          имени, термину, определениям и конвенции. Нажмите Enter или уйдите из поля — гид продолжится.
        </p>
        <p>
          Подробнее — в руководстве по <TourHelpLink text='списку конституент' topic={HelpTopic.UI_SCHEMA_LIST} />.
        </p>
      </>
    )
  },
  selection: {
    title: 'Счётчик выделения',
    body: (
      <p>
        Счётчик слева показывает число выделенных конституент из общего количества. Щелчок по строке выделяет;{' '}
        <kbd>Esc</kbd> снимает выделение.
      </p>
    )
  },
  toolbar: {
    title: 'Панель списка',
    body: (
      <>
        <p>
          <IconNewItem className='inline-icon icon-green' /> создать, <IconClone className='inline-icon icon-green' />{' '}
          клонировать и <IconDestroy className='inline-icon icon-red' /> удалить выбранные.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> меняют порядок;{' '}
          <IconCrucial className='inline-icon' /> отмечает ключевые конституенты.
        </p>
        <p>
          Если открыта модель, <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>)
          пересчитывает все значения.
        </p>
      </>
    )
  },
  interact: {
    title: 'Работа с таблицей',
    body: (
      <>
        <p>
          <kbd>Shift</kbd>+щелчок расширяет выделение. Двойной щелчок или щелчок с <kbd>Alt</kbd> открывает конституенту
          в <TourHelpLink text='редакторе' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Перетаскивайте строки, чтобы изменить порядок. При активном поиске перестановка отключена — очистите строку
          поиска.
        </p>
      </>
    )
  }
};
