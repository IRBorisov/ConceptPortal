import { BiCheckShield, BiShareAlt } from 'react-icons/bi';
import { FiBell } from 'react-icons/fi';

function HelpLibrary() {
  return (
  <div className='max-w-[80rem]'>
    <h1>Библиотека концептуальных схем</h1>
    <p>В библиотеки собраны различные концептуальные схемы.</p>
    <p>Группировка и классификации схем на данный момент не проводится.</p>
    <p>На текущем этапе происходит наполнение Библиотеки концептуальными схемами.</p>
    <p>Поиск осуществляется с помощью инструментов в верхней части страницы.</p>
    <div className='flex items-center gap-2'>
      <FiBell size='1rem'/>
      <p>Аттрибут <b>отслеживаемая</b> обозначает отслеживание схемы.</p>
    </div>
    <div className='flex items-center gap-2'>
      <BiShareAlt size='1rem'/>
      <p>Аттрибут <b>общедоступная</b> делает схему видимой в разделе библиотека.</p>
    </div>
    <div className='flex items-center gap-2'>
      <BiCheckShield size='1rem'/>
      <p>Аттрибут <b>неизменная</b> выделяет стандартные схемы.</p>
    </div>
  </div>);
}

export default HelpLibrary;