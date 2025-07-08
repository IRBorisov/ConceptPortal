import {
  IconChild,
  IconClone,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconKeyboard,
  IconLeftOpen,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconSave,
  IconSettings,
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
          <h2>Команды</h2>
          <ul>
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
              <IconFilter className='inline-icon' />
              <IconSettings className='inline-icon' /> фильтрация по графу термов
            </li>
            <li>
              <IconChild className='inline-icon' /> отображение наследованных
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
          <IconEdit className='inline-icon' /> редактирование{' '}
          <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} /> /{' '}
          <LinkTopic text='Термина' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + Пробел' : 'Ctrl + Пробел'}</kbd> открывает редактирование отсылок
        </li>
      </ul>
    </div>
  );
}
