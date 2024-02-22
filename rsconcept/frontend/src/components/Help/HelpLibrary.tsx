import { BiCheckShield, BiShareAlt } from 'react-icons/bi';
import { FiBell } from 'react-icons/fi';

function HelpLibrary() {
  // prettier-ignore
  return (
  <div>
    <h1>Библиотека схем</h1>
    <p>В библиотеки собраны концептуальные схемы - системы понятий, используемые в теории и практике концептуального проектирования систем организационного управления</p>
    <p>Фильтрация с помощью инструментов в верхней части страницы</p>
    <p>Сортировка по клику на заголовок таблицы</p>
    <div className='flex items-center gap-2'>
      <FiBell size='1rem'/>
      <p><b>отслеживаемая</b> обозначает отслеживание схемы</p>
    p</div>
    <div className='flex items-center gap-2'>
      <BiShareAlt size='1rem'/>
      <p><b>общедоступная</b> отображает схему всем пользователям</p>
    </div>
    <div className='flex items-center gap-2'>
      <BiCheckShield size='1rem'/>
      <p><b>неизменная</b> выделяет стандартные схемы</p>
    </div>
  </div>);
}

export default HelpLibrary;
