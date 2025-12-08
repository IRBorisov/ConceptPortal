import { IconCrucialValue } from '@/features/rsform/components/icon-crucial-value';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import { Divider } from '@/components/container';
import {
  IconChild,
  IconClustering,
  IconContextSelection,
  IconCrucial,
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
  IconGroupSelection,
  IconImage,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
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
        <div className='sm:w-60'>
          <h2>Настройка графа</h2>
          <ul>
            <li>Цвет – покраска узлов</li>
            <li>
              Связи – выбор типов <LinkTopic text='связей' topic={HelpTopic.CC_RELATIONS} />
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
              <IconText className='inline-icon' /> Отображение текста
            </li>
            <li>
              <IconClustering className='inline-icon' /> Скрыть порожденные
            </li>
            <li>
              <IconTypeGraph className='inline-icon' /> Открыть{' '}
              <LinkTopic text='граф ступеней' topic={HelpTopic.UI_TYPE_GRAPH} />
            </li>
            <li>
              <IconImage className='inline-icon' /> Сохранить изображение
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-80'>
          <h2>Изменение узлов</h2>
          <ul>
            <li>Клик на узел – выделение</li>
            <li>Левый клик – фокус-конституента</li>
            <li>
              <IconReset className='inline-icon' /> <kbd>Esc</kbd> – сбросить выделение
            </li>
            <li>
              <IconEdit className='inline-icon' /> Двойной клик – редактирование
            </li>
            <li>
              <IconCrucialValue value={true} className='inline-icon' /> <kbd>F</kbd> – переключение статуса ключевой
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> <kbd>Delete</kbd> – удалить выбранные
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> Новая со ссылками на выделенные
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-60'>
          <h2>Общие</h2>
          <ul>
            <li>
              <kbd>Space</kbd> – перемещение экрана
            </li>
            <li>
              <kbd>WASD</kbd> - направленное перемещение
            </li>
            <li>
              <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Просмотр графа
            </li>
            <li>
              <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Редактирование связей
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> Атрибутирование
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> Определение
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-84'>
          <h2>Выделение</h2>
          <ul>
            <li>
              <IconContextSelection className='inline-icon' /> выделить связанные...
            </li>
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
              <IconGroupSelection className='inline-icon' /> выделить группы...
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> выделить <LinkTopic text='Ядро' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconCrucial className='inline-icon' /> выделить ключевые
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> выделить{' '}
              <LinkTopic text='собственные' topic={HelpTopic.CC_PROPAGATION} />
            </li>
            <li>
              <IconChild className='inline-icon' /> выделить{' '}
              <LinkTopic text='наследники' topic={HelpTopic.CC_PROPAGATION} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
