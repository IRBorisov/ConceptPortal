import {
  IconFolder,
  IconFolderClosed,
  IconFolderEmpty,
  IconFolderOpened,
  IconFolderTree,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc
} from '@/components/Icons';

function HelpLibrary() {
  return (
    <div>
      <h1>Библиотека схем</h1>
      <p>В библиотеке собраны концептуальные схемы, эксплицированные в родоструктурном аппарате</p>

      <h2>Интерфейс</h2>
      <li>Ctrl + клик по строке откроет схему в новой вкладке</li>
      <li>
        <IconShow size='1rem' className='inline-icon' /> фильтры атрибутов применяются по клику
      </li>
      <li>
        <IconSortAsc size='1rem' className='inline-icon' />
        <IconSortDesc size='1rem' className='inline-icon' /> сортировка по клику на заголовок таблицы
      </li>
      <li>
        <IconSearch size='1rem' className='inline-icon' /> фильтр по названию и шифру
      </li>
      <li>
        <IconFolder size='1rem' className='inline-icon' /> фильтр по расположению
      </li>

      <h2>Проводник</h2>
      <li>клик по папке отображает справа файлы в ней</li>
      <li>клик по иконке сворачивает/разворачивает вложенные</li>
      <li>
        <IconFolderTree size='1rem' className='inline-icon' /> скрыть / отобразить Проводник
      </li>
      <li>
        <IconFolderEmpty size='1rem' className='inline-icon' /> папка без файлов
      </li>
      <li>
        <IconFolder size='1rem' className='inline-icon' /> папка без вложенных
      </li>
      <li>
        <IconFolderClosed size='1rem' className='inline-icon' /> папка с вложенными
      </li>
      <li>
        <IconFolderOpened size='1rem' className='inline-icon icon-green' /> развернутая папка
      </li>
    </div>
  );
}

export default HelpLibrary;
