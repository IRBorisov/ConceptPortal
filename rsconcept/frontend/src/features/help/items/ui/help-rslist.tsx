import { Divider } from '@/components/container';
import {
  IconAlias,
  IconClone,
  IconDestroy,
  IconDownload,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconOSS,
  IconReset
} from '@/components/icons';

import { InfoCstStatus } from '../../components/info-cst-status';
import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSList() {
  return (
    <div className='dense'>
      <h1>Список конституент</h1>
      <ul>
        <li>
          <IconAlias className='inline-icon' />
          Конституенты обладают уникальным <LinkTopic text='Именем' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>при наведении на имя отображаются атрибуты</li>
        <li>
          пунктиром отображаются <LinkTopic text='наследованные' topic={HelpTopic.CC_OSS} /> конституенты
        </li>
      </ul>

      <h2>Управление списком</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <IconReset className='inline-icon' /> сбросить выделение: <kbd>ESC</kbd>
        </li>
        <li>Клик на строку – выделение</li>
        <li>
          <kbd>Shift + клик</kbd> – выделение нескольких
        </li>
        <li>
          <kbd>Alt + клик</kbd> – Редактор
        </li>
        <li>
          <kbd>Двойной клик</kbd> – Редактор
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + вверх/вниз</kbd> – перемещение
        </li>

        <li>
          <IconClone className='inline-icon icon-green' /> клонировать выделенную: <kbd>Alt + V</kbd>
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> новая конституента: <kbd>Alt + `</kbd>
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> быстрое добавление: <kbd>Alt + 1-6,Q,W</kbd>
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удаление выделенных: <kbd>Delete</kbd>
        </li>
        <li>
          <IconDownload className='inline-icon' /> выгрузка таблицы в файл
        </li>
      </ul>

      <Divider margins='my-2' />

      <InfoCstStatus title='Статусы' />
    </div>
  );
}
