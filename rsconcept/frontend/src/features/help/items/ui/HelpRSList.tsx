import { Divider } from '@/components/Container';
import {
  IconAlias,
  IconClone,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconOSS,
  IconReset
} from '@/components/Icons';

import { InfoCstStatus } from '../../components/InfoCstStatus';
import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

export function HelpRSList() {
  return (
    <div className='dense'>
      <h1>Список конституент</h1>
      <li>
        <IconAlias className='inline-icon' />
        Конституенты обладают уникальным <LinkTopic text='Именем' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>
      <li>при наведении на имя отображаются атрибуты</li>
      <li>
        пунктиром отображаются <LinkTopic text='наследованные' topic={HelpTopic.CC_OSS} /> конституенты
      </li>

      <h2>Управление списком</h2>
      <li>
        <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
      </li>
      <li>
        <IconReset className='inline-icon' /> сбросить выделение: ESC
      </li>
      <li>Клик на строку – выделение</li>
      <li>Shift + клик – выделение нескольких</li>
      <li>Alt + клик – Редактор</li>
      <li>Двойной клик – Редактор</li>
      <li>
        <IconMoveUp className='inline-icon' />
        <IconMoveDown className='inline-icon' /> Alt + вверх/вниз – перемещение
      </li>

      <li>
        <IconClone className='inline-icon icon-green' /> клонировать выделенную: Alt + V
      </li>
      <li>
        <IconNewItem className='inline-icon icon-green' /> новая конституента: Alt + `
      </li>
      <li>
        <IconOpenList className='inline-icon icon-green' /> быстрое добавление: Alt + 1-6,Q,W
      </li>
      <li>
        <IconDestroy className='inline-icon icon-red' /> удаление выделенных: Delete
      </li>

      <Divider margins='my-2' />

      <InfoCstStatus title='Статусы' />
    </div>
  );
}
