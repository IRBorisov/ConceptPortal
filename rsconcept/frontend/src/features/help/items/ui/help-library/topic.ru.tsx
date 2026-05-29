import { useTx } from '@/i18n/use-tx';

import {
  IconAnimationOff,
  IconContextSelection,
  IconDownload,
  IconFilter,
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconOSS,
  IconRSModel,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders,
  IconUserSearch
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpLibraryRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.library')}</h1>
      <ul>
        <li>
          <span className='text-accent-green-foreground'>зеленым </span> выделены{' '}
          <IconOSS size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='операционные схемы' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <span className='text-accent-orange-foreground'>оранжевым </span> выделены{' '}
          <IconRSModel size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='концептуальные модели' topic={HelpTopic.CC_RSMODEL} />
        </li>
        <li>
          <kbd>клик</kbd> по строке - переход к редактированию схемы
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + клик' : 'Ctrl + клик'}</kbd> по строке откроет схему в новой вкладке
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

      <h2>{tx('tx.general.search')}</h2>
      <ul>
        <li>
          <IconSearch className='inline-icon' /> режим «Метаданные» — поиск по сокращению, названию и описанию элемента
          библиотеки
        </li>
        <li>
          <IconContextSelection className='inline-icon' /> режим «Контекстный поиск» — поиск по тексту внутри схем,
          моделей и ОСС: термины, определения, комментарии, операции и блоки
        </li>
        <li>
          <IconFilter className='inline-icon' /> в контекстном режиме — выбор атрибутов для поиска; по умолчанию
          используются все поля
        </li>
      </ul>

      <h2>{tx('tx.lib.location.explorer')}</h2>
      <ul>
        <li>
          <kbd>клик</kbd> по папке разворачивает дерево проводника
        </li>
        <li>
          <kbd>клик</kbd> по строке отображает справа схемы в ней
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
    </>
  );
}
