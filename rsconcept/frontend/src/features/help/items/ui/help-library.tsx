import {
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconFolderSearch,
  IconFolderTree,
  IconOSS,
  IconRSForm,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders,
  IconUserSearch
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpLibrary() {
  return (
    <div>
      <h1>Библиотека схем</h1>
      <p>
        В библиотеке собраны <IconRSForm size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='концептуальные схемы' topic={HelpTopic.CC_SYSTEM} /> (КС) <br />и
        <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='операционные схемы синтеза' topic={HelpTopic.CC_OSS} /> (ОСС).
      </p>

      <ul>
        <li>
          <span className='text-(--acc-fg-green)'>зеленым текстом</span> выделены ОСС
        </li>
        <li>
          <kbd>клик</kbd> по строке - переход к редактированию схемы
        </li>
        <li>
          <kbd>Ctrl + клик</kbd> по строке откроет схему в новой вкладке
        </li>
        <li>Фильтры атрибутов три позиции: да/нет/не применять</li>
        <li>
          <IconShow size='1rem' className='inline-icon' /> фильтры атрибутов применяются по клику
        </li>
        <li>
          <IconSortAsc size='1rem' className='inline-icon' />
          <IconSortDesc size='1rem' className='inline-icon' /> сортировка по клику на заголовок таблицы
        </li>
        <li>
          <IconUserSearch size='1rem' className='inline-icon' /> фильтр по пользователю
        </li>
        <li>
          <IconSearch size='1rem' className='inline-icon' /> фильтр по названию и шифру
        </li>
        <li>
          <IconFolderSearch size='1rem' className='inline-icon' /> фильтр по расположению
        </li>
        <li>
          <IconFilterReset size='1rem' className='inline-icon' /> сбросить фильтры
        </li>
        <li>
          <IconFolderTree size='1rem' className='inline-icon' /> переключение между Проводник и Таблица
        </li>
      </ul>

      <h2>Режим: Проводник</h2>
      <ul>
        <li>
          <IconFolderEdit size='1rem' className='inline-icon' /> переименовать выбранную
        </li>
        <li>
          <IconSubfolders size='1rem' className='inline-icon icon-green' /> схемы во вложенных папках
        </li>
        <li>
          <kbd>клик</kbd> по папке отображает справа схемы в ней
        </li>
        <li>
          <kbd>Ctrl + клик по папке копирует путь в буфер обмена</kbd>
        </li>
        <li>
          <kbd>клик</kbd> по иконке сворачивает/разворачивает вложенные
        </li>
        <li>
          <IconFolderEmpty size='1rem' className='inline-icon text-foreground' /> папка без схем
        </li>
        <li>
          <IconFolderEmpty size='1rem' className='inline-icon' /> папка с вложенными без схем
        </li>
        <li>
          <IconFolder size='1rem' className='inline-icon' /> папка без вложенных
        </li>
        <li>
          <IconFolderClosed size='1rem' className='inline-icon' /> папка с вложенными и схемами
        </li>
        <li>
          <IconFolderOpened size='1rem' className='inline-icon icon-green' /> развернутая папка
        </li>
      </ul>
    </div>
  );
}
