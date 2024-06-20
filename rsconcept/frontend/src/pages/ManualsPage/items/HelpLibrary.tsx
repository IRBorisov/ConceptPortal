import {
  IconFilterReset,
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

      <li>клик по строке - переход к редактированию схемы</li>
      <li>Ctrl + клик по строке откроет схему в новой вкладке</li>
      <li>Фильтры атрибутов три позиции: да/нет/не применять</li>
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
      <li>
        <IconFilterReset size='1rem' className='inline-icon' /> сбросить фильтры
      </li>
      <li>
        <IconFolderTree size='1rem' className='inline-icon' /> переключение между Проводник и Поиск
      </li>

      <h2>Режим: Проводник</h2>
      <li>клик по папке отображает справа файлы в ней</li>
      <li>Ctrl + клик по папке копирует путь в буфер обмена</li>
      <li>клик по иконке сворачивает/разворачивает вложенные</li>
      <li>
        <IconFolderEmpty size='1rem' className='inline-icon clr-text-default' /> папка без файлов
      </li>
      <li>
        <IconFolderEmpty size='1rem' className='inline-icon' /> папка с вложенными без файлов
      </li>
      <li>
        <IconFolder size='1rem' className='inline-icon' /> папка без вложенных
      </li>
      <li>
        <IconFolderClosed size='1rem' className='inline-icon' /> папка с вложенными и файлами
      </li>
      <li>
        <IconFolderOpened size='1rem' className='inline-icon icon-green' /> развернутая папка
      </li>
    </div>
  );
}

export default HelpLibrary;
