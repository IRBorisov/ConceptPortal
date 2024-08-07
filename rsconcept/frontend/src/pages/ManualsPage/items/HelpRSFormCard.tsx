import {
  IconClone,
  IconDestroy,
  IconDownload,
  IconEditor,
  IconFollow,
  IconImmutable,
  IconOSS,
  IconOwner,
  IconPublic,
  IconSave
} from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpRSFormCard() {
  return (
    <div className='dense'>
      <h1>Карточка схемы</h1>

      <p>Карточка содержит общую информацию и статистику</p>
      <p>
        Карточка позволяет управлять атрибутами схемы и <LinkTopic text='версиями' topic={HelpTopic.VERSIONS} />
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
        <IconImmutable className='inline-icon' /> Неизменные схемы редактируют только администраторы
      </li>
      <li>
        <IconClone className='inline-icon icon-green' /> Клонировать – создать копию схемы
      </li>
      <li>
        <IconFollow className='inline-icon' /> Отслеживание – схема в персональном списке
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

export default HelpRSFormCard;
