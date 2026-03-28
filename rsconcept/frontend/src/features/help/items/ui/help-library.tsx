import {
  IconAnimationOff,
  IconDownload,
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconLeftClose,
  IconOSS,
  IconRSForm,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders,
  IconUserSearch
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpLibrary() {
  return (
    <div>
      <h1>Библиотека схем</h1>
      <p className='m-0'>
        В библиотеке собраны <IconRSForm size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='концептуальные схемы' topic={HelpTopic.CC_SYSTEM} /> (КС) <br />и
        <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='операционные схемы синтеза' topic={HelpTopic.CC_OSS} /> (ОСС).
      </p>

      <ul>
        <li>
          <span className='text-accent-green-foreground'>зеленым </span> выделены ОСС
        </li>
        <li>
          <span className='text-accent-orange-foreground'>оранжевым </span> выделены модели
        </li>
        <li>
          <kbd>клик</kbd> по строке - переход к редактированию схемы
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + клик' : 'Ctrl + клик'}</kbd> по строке откроет схему в новой вкладке
        </li>
        <li>
          <IconLeftClose className='inline-icon' /> отображение Проводника
        </li>
        <li>
          <IconShow className='inline-icon' /> фильтры атрибутов применяются по клику
        </li>
        <li>
          <IconAnimationOff className='inline-icon' /> фильтр по типу
        </li>
        <li>
          <IconUserSearch className='inline-icon' /> фильтр по пользователю
        </li>
        <li>
          <IconSearch className='inline-icon' /> фильтр по названию и сокращению
        </li>
        <li>
          <IconFilterReset className='inline-icon' /> сбросить фильтры
        </li>
        <li>
          <IconSortAsc className='inline-icon' />
          <IconSortDesc className='inline-icon' /> сортировка по клику на заголовок таблицы
        </li>
        <li>
          <IconDownload className='inline-icon' /> выгрузка таблицы в файл
        </li>
      </ul>

      <h2>Проводник</h2>
      <ul>
        <li>
          <kbd>клик</kbd> разворачивает дерево проводника
        </li>
        <li>
          <kbd>двойной клик</kbd> по папке отображает справа схемы в ней
        </li>
        <li>
          <kbd>
            {isMac()
              ? 'Cmd + клик по папке копирует путь в буфер обмена'
              : 'Ctrl + клик по папке копирует путь в буфер обмена'}
          </kbd>
        </li>
        <li>
          <kbd>клик</kbd> по иконке сворачивает/разворачивает вложенные
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> переименовать выбранную
        </li>
        <li>
          <IconSubfolders className='inline-icon' /> схемы во вложенных папках
        </li>
        <li>
          <IconFolderEmpty className='inline-icon text-foreground' /> папка без схем
        </li>
        <li>
          <IconFolderEmpty className='inline-icon' /> папка с вложенными без схем
        </li>
        <li>
          <IconFolder className='inline-icon' /> папка без вложенных
        </li>
        <li>
          <IconFolderClosed className='inline-icon' /> папка с вложенными и схемами
        </li>
        <li>
          <IconFolderOpened className='inline-icon icon-green' /> развернутая папка
        </li>
      </ul>
    </div>
  );
}
