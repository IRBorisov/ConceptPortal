import {
  IconDestroy,
  IconEditor,
  IconFolderEdit,
  IconImmutable,
  IconLeftOpen,
  IconOSS,
  IconOwner,
  IconPublic,
  IconSave,
  IconShare
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSCard() {
  return (
    <div className='dense'>
      <h1>Паспорт схемы</h1>

      <p>Паспорт содержит общую информацию и статистику</p>
      <p>
        Паспорт позволяет управлять атрибутами и <LinkTopic text='версиями' topic={HelpTopic.VERSIONS} />
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <IconSave className='inline-icon' /> сохранить изменения: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> скопировать ссылку на схему
        </li>
        <li>
          <IconEditor className='inline-icon' /> редактор обладает правом редактирования
        </li>
        <li>
          <IconOwner className='inline-icon' /> владелец обладает полным доступом к схеме
        </li>
        <li>
          <IconPublic className='inline-icon' /> общедоступные схемы видны всем посетителям
        </li>
        <li>
          <IconImmutable className='inline-icon' /> неизменные схемы
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить схему из базы Портала
        </li>
        <li>
          <IconLeftOpen className='inline-icon' /> отображение статистики
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> редактирование расположения
        </li>
      </ul>
    </div>
  );
}
