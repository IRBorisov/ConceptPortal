import { Divider } from '@/components/container';
import {
  IconClustering,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphMaximize,
  IconGraphOutputs,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconRotate3D,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSGraphTerm() {
  return (
    <div className='flex flex-col'>
      <h1>Граф термов</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-56'>
          <h2>Настройка графа</h2>
          <ul>
            <li>Цвет – покраска узлов</li>
            <li>
              <IconText className='inline-icon' /> Отображение текста
            </li>
            <li>
              <IconClustering className='inline-icon' /> Скрыть порожденные
            </li>
            <li>
              <IconRotate3D className='inline-icon' /> Вращение 3D
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-84'>
          <h2>Изменение узлов</h2>
          <ul>
            <li>Клик на узел – выделение</li>
            <li>Левый клик – выбор фокус-конституенты</li>
            <li>
              <IconReset className='inline-icon' /> Esc – сбросить выделение
            </li>
            <li>
              <IconEdit className='inline-icon' /> Двойной клик – редактирование
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> Delete – удалить выбранные
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> Новая со ссылками на выделенные
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-56'>
          <h2>Общие</h2>
          <ul>
            <li>
              <kbd>Space</kbd> – перемещение экрана
            </li>
            <li>
              <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconFilter className='inline-icon' /> Открыть настройки
            </li>
            <li>
              <IconFocus className='inline-icon' /> Задать фокус
            </li>
            <li>
              <IconFitImage className='inline-icon' /> Вписать в экран
            </li>
            <li>
              <IconTypeGraph className='inline-icon' /> Открыть{' '}
              <LinkTopic text='граф ступеней' topic={HelpTopic.UI_TYPE_GRAPH} />
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-84'>
          <h2>Выделение</h2>
          <ul>
            <li>
              <IconGraphCollapse className='inline-icon' /> все влияющие
            </li>
            <li>
              <IconGraphExpand className='inline-icon' /> все зависимые
            </li>
            <li>
              <IconGraphMaximize className='inline-icon' /> зависимые только от выделенных
            </li>
            <li>
              <IconGraphInputs className='inline-icon' /> входящие напрямую
            </li>
            <li>
              <IconGraphOutputs className='inline-icon' /> исходящие напрямую
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> выделить <LinkTopic text='Ядро' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> выделить{' '}
              <LinkTopic text='собственные' topic={HelpTopic.CC_PROPAGATION} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
