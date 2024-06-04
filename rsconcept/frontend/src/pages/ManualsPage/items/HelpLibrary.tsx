import { IconFolder, IconSearch, IconShow, IconSortAsc, IconSortDesc } from '@/components/Icons';

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
    </div>
  );
}

export default HelpLibrary;
