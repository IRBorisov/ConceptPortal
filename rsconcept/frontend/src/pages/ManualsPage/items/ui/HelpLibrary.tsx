import {
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconFolderTree,
  IconOSS,
  IconRSForm,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders
} from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

function HelpLibrary() {
  const { colors } = useConceptOptions();
  return (
    <div>
      <h1>Библиотека схем</h1>
      <p>
        В библиотеке собраны <IconRSForm size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='концептуальные схемы' topic={HelpTopic.CC_SYSTEM} /> (КС) <br />и
        <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='операционные схемы синтеза' topic={HelpTopic.CC_OSS} /> (ОСС).
      </p>

      <li>
        <span style={{ color: colors.fgGreen }}>зеленым текстом</span> выделены ОСС
      </li>
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
      <li>
        <IconFolderEdit size='1rem' className='inline-icon' /> переименовать выбранную
      </li>
      <li>
        <IconSubfolders size='1rem' className='inline-icon icon-green' /> схемы во вложенных папках
      </li>
      <li>клик по папке отображает справа схемы в ней</li>
      <li>Ctrl + клик по папке копирует путь в буфер обмена</li>
      <li>клик по иконке сворачивает/разворачивает вложенные</li>
      <li>
        <IconFolderEmpty size='1rem' className='inline-icon clr-text-default' /> папка без схем
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
    </div>
  );
}

export default HelpLibrary;
