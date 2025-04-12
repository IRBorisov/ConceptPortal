import {
  IconChild,
  IconClone,
  IconControls,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconList,
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

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSEditor() {
  return (
    <div className='dense'>
      <h1>Редактор конституенты</h1>
      <div className='flex flex-col sm:flex-row sm:gap-3'>
        <div className='flex flex-col'>
          <li>
            <IconOSS className='inline-icon' /> переход к <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
          </li>
          <li>
            <IconPredecessor className='inline-icon' /> переход к исходной
          </li>
          <li>
            <IconList className='inline-icon' /> список конституент
          </li>
          <li>
            <IconSave className='inline-icon' /> сохранить: <kbd>Ctrl + S</kbd>
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
        </div>

        <div className='flex flex-col'>
          <h2>Список конституент</h2>
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
            <span className='bg-selected'>текущая конституента</span>
          </li>
          <li>
            <span className='bg-(--acc-bg-green50)'>
              <LinkTopic text='основа' topic={HelpTopic.CC_RELATIONS} /> текущей
            </span>
          </li>
          <li>
            <span className='bg-(--acc-bg-orange50)'>
              <LinkTopic text='порожденные' topic={HelpTopic.CC_RELATIONS} /> текущей
            </span>
          </li>
        </div>
      </div>

      <h2>Формальное определение</h2>
      <li>
        <IconStatusOK className='inline-icon' /> индикатор статуса определения сверху
      </li>
      <li>
        <IconControls className='inline-icon' /> специальная клавиатура и горячие клавиши
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
        <kbd>Ctrl + Пробел</kbd> вставка незанятого имени / замена проекции
      </li>

      <h2>Термин и Текстовое определение</h2>
      <li>
        <IconEdit className='inline-icon' /> редактирование <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} />{' '}
        / <LinkTopic text='Термина' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>
      <li>
        <kbd>Ctrl + Пробел</kbd> открывает редактирование отсылок
      </li>
    </div>
  );
}
