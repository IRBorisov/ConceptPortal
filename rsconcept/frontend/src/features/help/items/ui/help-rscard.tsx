import {
  IconClone,
  IconDestroy,
  IconDownload,
  IconEditor,
  IconImmutable,
  IconOSS,
  IconOwner,
  IconPublic,
  IconSave
} from '@/components/icons1';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSCard() {
  return (
    <div className='dense'>
      <h1>Карточка схемы</h1>

      <p>Карточка содержит общую информацию и статистику</p>
      <p>
        Карточка позволяет управлять атрибутами и <LinkTopic text='версиями' topic={HelpTopic.VERSIONS} />
      </p>
      <p>
        Карточка позволяет назначать <IconEditor className='inline-icon' /> Редакторов
      </p>
      <p>
        Карточка позволяет изменить <IconOwner className='inline-icon icon-green' /> Владельца
      </p>

      <h2>Управление</h2>
      <li>
        <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
      </li>
      <li>
        <IconSave className='inline-icon' /> сохранить изменения: Ctrl + S
      </li>
      <li>
        <IconEditor className='inline-icon' /> Редактор обладает правом редактирования
      </li>
      <li>
        <IconOwner className='inline-icon' /> Владелец обладает полным доступом к схеме
      </li>
      <li>
        <IconPublic className='inline-icon' /> Общедоступные схемы видны всем посетителям
      </li>
      <li>
        <IconImmutable className='inline-icon' /> Неизменные схемы
      </li>
      <li>
        <IconClone className='inline-icon icon-green' /> Клонировать – создать копию схемы
      </li>
      <li>
        <IconDownload className='inline-icon' /> Загрузить/Выгрузить – взаимодействие с Экстеор
      </li>
      <li>
        <IconDestroy className='inline-icon icon-red' /> Удалить – полностью удаляет схему из базы Портала
      </li>
    </div>
  );
}
