import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset,
  IconSearch
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const constituentsListContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Список конституент',
    body: (
      <p>
        Конституенты — части концептуальной схемы: неопределяемые понятия, термы, функции, аксиомы, высказывания и др. На
        вкладке Список они собраны в таблице; если открыта модель — ещё колонка «Значение». Руководства:{' '}
        <TourHelpLink text='список схемы' topic={HelpTopic.UI_SCHEMA_LIST} />,{' '}
        <TourHelpLink text='список модели' topic={HelpTopic.UI_MODEL_LIST} />.
      </p>
    )
  },
  filter: {
    title: 'Поиск',
    body: (
      <>
        <p>
          Попробуйте: введите текст в строку <IconSearch className='inline-icon' /> поиска. Список отфильтруется по
          имени, термину, формальному и текстовому определению, конвенции или комментарию. Нажмите Enter или щёлкните
          вне поля — гид продолжится.
        </p>
        <p>
          Подробнее — в руководствах по{' '}
          <TourHelpLink text='списку схемы' topic={HelpTopic.UI_SCHEMA_LIST} /> и{' '}
          <TourHelpLink text='списку модели' topic={HelpTopic.UI_MODEL_LIST} />.
        </p>
      </>
    )
  },
  selection: {
    title: 'Выбраны … из …',
    body: (
      <p>
        Слева показано, сколько конституент выбрано из общего числа. Щелчок по строке выбирает; <kbd>Esc</kbd> или{' '}
        <IconReset className='inline-icon' /> на панели сбрасывает выбор. Счётчик и панель доступны только в режиме
        редактирования.
      </p>
    )
  },
  toolbar: {
    title: 'Панель списка',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> сбрасывает выбор (<kbd>Esc</kbd>). В модели следом{' '}
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает все значения.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> меняют порядок;{' '}
          <IconCrucial className='inline-icon' /> отмечает ключевые конституенты.
        </p>
        <p>
          <IconOpenList className='inline-icon icon-green' /> создаёт по типу,{' '}
          <IconNewItem className='inline-icon icon-green' /> — через диалог;{' '}
          <IconClone className='inline-icon icon-green' /> клонирует и{' '}
          <IconDestroy className='inline-icon icon-red' /> удаляет выбранные. Панель видна только при редактировании.
        </p>
      </>
    )
  },
  interact: {
    title: 'Работа с таблицей',
    body: (
      <>
        <p>
          <kbd>Shift</kbd>+щелчок расширяет выбор. Двойной щелчок или щелчок с <kbd>Alt</kbd> открывает конституенту: в
          схеме — вкладка <TourHelpLink text='Понятие' topic={HelpTopic.UI_SCHEMA_EDITOR} />, в модели — вкладка{' '}
          <TourHelpLink text='Данные' topic={HelpTopic.UI_MODEL_VALUE} />.
        </p>
        <p>
          Перетаскивайте строки, чтобы изменить порядок. При активном поиске перестановка (и стрелки на панели)
          отключена — очистите строку поиска.
        </p>
      </>
    )
  }
};
