import { IconImmutable, IconPublic } from '../Icons';

function HelpLibrary() {
  // prettier-ignore
  return (
  <div>
    <h1>Библиотека схем</h1>
    <p>В библиотеки собраны концептуальные схемы, используемые в теории и практике концептуального проектирования систем организационного управления</p>
    <p>Фильтрация с помощью инструментов в верхней части страницы</p>
    <p>Сортировка по клику на заголовок таблицы</p>
    <h2>Отображение статусов</h2>
    <div className='flex items-center gap-2'>
      <IconPublic size='1rem'/>
      <p><b>общедоступная</b> отображает схему всем пользователям</p>
    </div>
    <div className='flex items-center gap-2'>
      <IconImmutable size='1rem'/>
      <p><b>неизменная</b> выделяет стандартные схемы</p>
    </div>
  </div>);
}

export default HelpLibrary;
