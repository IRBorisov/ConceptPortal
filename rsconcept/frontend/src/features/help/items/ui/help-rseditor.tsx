import {
  IconChild,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconFilterReset,
  IconGraphCore,
  IconKeyboard,
  IconLeftOpen,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconSave,
  IconSearch,
  IconStatusError,
  IconStatusOK,
  IconTree,
  IconTypeGraph
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSEditor() {
  return (
    <div className='dense'>
      <h1>Редактор конституенты</h1>

      <div className='flex flex-col sm:flex-row sm:gap-3'>
        <div>
          <h2>Управление</h2>
          <ul>
            <li>
              <IconCrucial className='inline-icon' /> статус ключевой
            </li>
            <li>
              <IconOSS className='inline-icon' /> переход к <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> переход к исходной
            </li>
            <li>
              <IconLeftOpen className='inline-icon' /> список конституент
            </li>
            <li>
              <IconSave className='inline-icon' /> сохранить: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
            </li>
            <li>
              <IconReset className='inline-icon' /> сбросить изменения
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> клонировать: <kbd>Alt + V</kbd>
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> новая конституента
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> удалить
            </li>
          </ul>
        </div>

        <div>
          <h2>Список конституент</h2>
          <ul>
            <li>
              <IconMoveDown className='inline-icon' />
              <IconMoveUp className='inline-icon' /> <kbd>Alt + вверх/вниз</kbd>
            </li>
            <li>
              <IconFilterReset className='inline-icon' /> сбросить фильтр
            </li>
            <li>
              <IconSearch className='inline-icon' /> фильтрация по атрибутам
            </li>
            <li>
              <IconStatusError className='inline-icon' /> проблемные понятия
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> неопределяемые
            </li>
            <li>
              <IconCrucial className='inline-icon' /> ключевые
            </li>
            <li>
              <IconChild className='inline-icon' /> наследники
            </li>
            <li>
              <span className='cc-sample-color bg-selected' />
              выбранная конституента
            </li>
            <li>
              <span className='cc-sample-color bg-accent-green50' />
              <LinkTopic text='основа' topic={HelpTopic.CC_RELATIONS} /> выбранной
            </li>
            <li>
              <span className='cc-sample-color bg-accent-orange50' />
              <LinkTopic text='порожденные' topic={HelpTopic.CC_RELATIONS} /> выбранной
            </li>
          </ul>
        </div>
      </div>

      <h2>Формальное определение</h2>
      <ul>
        <li>
          <IconStatusOK className='inline-icon' /> индикатор статуса определения сверху
        </li>
        <li>
          <IconKeyboard className='inline-icon' /> специальная клавиатура и горячие клавиши
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> отображение{' '}
          <LinkTopic text='графа ступеней типизации' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> отображение{' '}
          <LinkTopic text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + Пробел' : 'Ctrl + Пробел'}</kbd> вставка незанятого имени / замена проекции
        </li>
      </ul>

      <h2>Термин и Текстовое определение</h2>
      <ul>
        <li>
          Редактирование <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} /> /{' '}
          <LinkTopic text='Термина' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <kbd>Alt + 1</kbd> редактирование отсылок
        </li>
        <li>
          <kbd>Alt + 2</kbd> редактирование связанных слов
        </li>
      </ul>
    </div>
  );
}
