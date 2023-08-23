import { urls } from '../../utils/constants';
import TextURL from '../Common/TextURL';

function HelpMain() {
  return (
    <div className='w-full lg:text-justify'>
      <h1>Портал</h1>
      <p><u>Портал</u> позволяет анализировать предметные области, формально записывать системы определений (<u>концептуальные схемы</u>) и синтезировать их с помощью математического аппарата родов структур.</p>
      <p>Навигация по порталу осуществляется верхнюю панель или ссылки в "подвале" страницы. Их можно скрыть с помощью кнопки в правом верхнем углу</p>
      <p className='mt-2'><b>Основные разделы Портала</b></p>
      <li><TextURL text='Библиотека' href='/library?filter=common' /> содержит обещдоступные схемы и инструменты поиска и навигации по ним</li>
      <li><TextURL text='Мои схемы' href='/library?filter=personal' /> содержит отслеживаемые и редактируемые схемы. Основной рабочий раздел</li>
      <p className='mt-2'><b>Поддержка Портала</b></p>
      <p>Портал разрабатывается <TextURL text='Центром Концепт' href={urls.concept}/> и является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={urls.gitrepo}/>.</p>
      <p>Ждём Ваши пожелания по доработке, найденные ошибки и иные предложения по адресу <TextURL href={urls.mailportal} text='portal@acconcept.ru'/></p>
      <p></p>
    </div>
  );
}

export default HelpMain;
