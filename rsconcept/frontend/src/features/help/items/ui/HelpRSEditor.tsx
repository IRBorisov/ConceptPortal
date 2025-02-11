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
} from '@/components/Icons';
import { APP_COLORS } from '@/styling/colors';

import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

function HelpRSEditor() {
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
            <IconSave className='inline-icon' /> сохранить: Ctrl + S
          </li>
          <li>
            <IconReset className='inline-icon' /> сбросить изменения
          </li>
          <li>
            <IconClone className='inline-icon icon-green' /> клонировать: Alt + V
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
            <IconMoveUp className='inline-icon' /> Alt + вверх/вниз
          </li>
          <li>
            <IconFilter className='inline-icon' />
            <IconSettings className='inline-icon' /> фильтрация по графу термов
          </li>
          <li>
            <IconChild className='inline-icon' /> отображение наследованных
          </li>
          <li>
            <span style={{ backgroundColor: APP_COLORS.bgSelected }}>текущая конституента</span>
          </li>
          <li>
            <span style={{ backgroundColor: APP_COLORS.bgGreen50 }}>
              <LinkTopic text='основа' topic={HelpTopic.CC_RELATIONS} /> текущей
            </span>
          </li>
          <li>
            <span style={{ backgroundColor: APP_COLORS.bgOrange50 }}>
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
      <li>Ctrl + Пробел вставка незанятого имени / замена проекции</li>

      <h2>Термин и Текстовое определение</h2>
      <li>
        <IconEdit className='inline-icon' /> редактирование <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} />{' '}
        / <LinkTopic text='Термина' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>
      <li>Ctrl + Пробел открывает редактирование отсылок</li>
    </div>
  );
}

export default HelpRSEditor;
