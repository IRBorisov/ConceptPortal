import { IconImmutable, IconPublic } from '../Icons';

function HelpLibrary() {
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Библиотека схем</h1>
    <p>В библиотеке собраны концептуальные схемы, эксплицированные в родоструктурном аппарате</p>
    <p>используемые при концептуального проектирования систем организационного управления</p>
    <p>Фильтрация с помощью инструментов в верхней части страницы</p>
    <p>Сортировка по клику на заголовок таблицы</p>
    
    <h2>Отображение статусов</h2>
    <p>- <IconPublic className='inline-icon'/> <b>общедоступная</b> отображает схему всем пользователям</p>
    <p>- <IconImmutable className='inline-icon'/> <b>неизменная</b> выделяет стандартные схемы</p>
  </div>);
}

export default HelpLibrary;
