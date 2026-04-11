import {
  IconDestroy,
  IconEditor,
  IconFolderEdit,
  IconLeftOpen,
  IconOwner,
  IconRSForm,
  IconSave,
  IconShare
} from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpRSModelCard() {
  return (
    <div className='dense'>
      <h1>Паспорт модели</h1>
      <p>Содержит основную информацию и статистику по модели.</p>
      <p>Название и атрибуты исходной концептуальной схемы здесь не редактируются.</p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> сохранить: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> копировать ссылку
        </li>
        <li>
          <IconLeftOpen className='inline-icon' /> статистика модели
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить из базы Портала
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> изменить расположение
        </li>
        <li>
          <IconEditor className='inline-icon' /> редакторы модели
        </li>
        <li>
          <IconOwner className='inline-icon' /> изменить владельца
        </li>
        <li>
          <IconRSForm className='inline-icon' /> перейти к концептуальной схеме
        </li>
      </ul>
    </div>
  );
}
