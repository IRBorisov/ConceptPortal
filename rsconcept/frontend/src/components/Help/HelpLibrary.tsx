import { EducationIcon, EyeIcon, GroupIcon } from '../Icons';

function HelpLibrary() {
  return (
    <div className=''>
      <h1>Библиотека концептуальных схем</h1>
      <p>В библиотеки собраны различные концептуальные схемы.</p>
      <p>Группировка и классификации схем на данный момент не проводится.</p>
      <p>На текущем этапе происходит наполнение Библиотеки концептуальными схемами.</p>
      <p>Поиск осуществлеяется с помощью инструментов в верхней части страницы.</p>
      <div className='flex items-center gap-2'>
        <EyeIcon size={4}/>
        <p>Аттрибут <b>отслеживаемая</b> обозначает отслеживание схемы.</p>
      </div>
      <div className='flex items-center gap-2'>
        <GroupIcon size={4}/>
        <p>Аттрибут <b>общедоступная</b> делает схему видимой в разделе библиотека.</p>
      </div>
      <div className='flex items-center gap-2'>
        <EducationIcon size={4}/>
        <p>Аттрибут <b>библиотечная</b> выделяет неизменяемые стандартные схемы.</p>
      </div>
    </div>
  );
}

export default HelpLibrary;
