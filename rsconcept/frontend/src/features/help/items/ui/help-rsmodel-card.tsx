import { IconDestroy, IconEditor, IconFolderEdit, IconLeftOpen, IconOwner, IconRSForm, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpRSModelCard() {
  return (
    <div className='dense'>
      <h1>Паспорт модели</h1>
      <p>Паспорт содержит общую информацию и статистику</p>
      <p>
        Паспорт модели не позволяет изменить свойства исходной концептуальной схемы
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> сохранить изменения: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> скопировать ссылку на схему
        </li>
        <li>
          <IconLeftOpen className='inline-icon' /> отображение статистики
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить модель из базы Портала
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> редактирование расположения
        </li>
        <li>
          <IconEditor className='inline-icon' /> определение редакторов
        </li>
        <li>
          <IconOwner className='inline-icon' /> изменение владельца
        </li>
        <li>
          <IconRSForm className='inline-icon' /> переход к связанной концептуальной схеме
        </li>
      </ul>
    </div>
  );
}
