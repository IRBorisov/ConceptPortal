import {
  IconClone,
  IconDestroy,
  IconEdit2,
  IconGenerateNames,
  IconLeftOpen,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconRSForm,
  IconSortList,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpOssSidebar() {
  return (
    <div className='flex flex-col'>
      <h1>Боковая панель</h1>
      <p className='m-0'>
        <IconLeftOpen className='inline-icon' />
        {'\u2009'} Боковая панель операционной схемы позволяет оперативно редактировать содержание{' '}
        <LinkTopic text='Концептуальной схемы' topic={HelpTopic.CC_SYSTEM} />, не переходя к ней напрямую.
      </p>
      <p className='mt-1'>
        Верхняя часть панели позволяет фильтровать список конституент аналогично{' '}
        <LinkTopic text='редактору конституенты' topic={HelpTopic.UI_RS_EDITOR} />.
      </p>
      <ul>
        <li>
          <IconRSForm className='inline-icon' /> меню редактирования концептуальной схемы
        </li>
        <li>
          <IconSortList className='inline-icon' /> упорядочить конституенты
        </li>
        <li>
          <IconGenerateNames className='inline-icon' /> перенумеровать
        </li>
        <li>
          <IconEdit2 className='inline-icon' /> редактировать конституенты
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> новая конституента
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> клонировать конституенту
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить конституенты
        </li>
        <li>
          <IconMoveDown className='inline-icon' />
          <IconMoveUp className='inline-icon' /> перемещение вверх/вниз
        </li>
        <li>
          <IconTree className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='граф термов' topic={HelpTopic.UI_GRAPH_TERM} />
        </li>
        <li>
          <IconTypeGraph className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='граф ступеней' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
      </ul>
    </div>
  );
}
