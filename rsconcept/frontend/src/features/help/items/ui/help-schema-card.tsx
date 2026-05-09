import { IconDestroy, IconEditor, IconFolderEdit, IconOSS, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpSchemaCard() {
  return (
    <div className='dense'>
      <h1>Паспорт концептуальной схемы</h1>

      <p>Паспорт содержит информацию о концептуальной схеме и её статистику.</p>
      <p>
        Позволяет управлять атрибутами и <LinkTopic text='версиями' topic={HelpTopic.VERSIONS} />.
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> связанная <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <IconSave className='inline-icon' /> сохранить: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> скопировать ссылку
        </li>
        <li>
          <IconEditor className='inline-icon' /> редактор — право редактирования
        </li>
        <li>
          <IconOwner className='inline-icon' /> владелец — полный доступ
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить схему
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> изменить расположение
        </li>
      </ul>
    </div>
  );
}
