import { urls } from '../../utils/constants';
import { LibraryFilterStrategy } from '../../utils/models';
import TextURL from '../Common/TextURL';

function HelpMain() {
  return (
    <div className='w-full lg:text-justify'>
      <h1>Портал</h1>
      <p className='lg:text-left indent-6'>Портал позволяет анализировать предметные области, формально записывать системы определений (концептуальные схемы) и синтезировать их с помощью математического аппарата родов структур.</p>
      <p className='lg:text-left indent-6'>Навигация по порталу осуществляется верхнюю панель или ссылки в "подвале" страницы. Их можно скрыть с помощью кнопки в правом верхнем углу</p>
      <p className='lg:text-left indent-6'>В меню пользователя (правый верхний угол) редактирование данных пользователя и изменение цветовой темы.</p>
      <p className='mt-4 mb-1 text-center'><b>Основные разделы</b></p>
      <li><TextURL text='Библиотека' href='/library' /> - все схемы доступные пользователю</li>
      <li><TextURL text='Общие схемы' href={`/library?filter=${LibraryFilterStrategy.COMMON}`} /> - общедоступные схемы и инструменты поиска и навигации по ним</li>
      <li><TextURL text='Мои схемы' href={`/library?filter=${LibraryFilterStrategy.PERSONAL}`} /> - отслеживаемые и редактируемые схемы. Основной рабочий раздел</li>
      <li><TextURL text='Профиль' href='/profile' /> - данные пользователя и смена пароля</li>
      <p className='mt-4 mb-1 text-center'><b>Поддержка</b></p>
      <p className='lg:text-left indent-6'>Портал разрабатывается <TextURL text='Центром Концепт' href={urls.concept}/> и является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={urls.gitrepo}/>.</p>
      <p className='lg:text-left indent-6'>Ждём Ваши пожелания по доработке, найденные ошибки и иные предложения по адресу <TextURL href={urls.mailportal} text='portal@acconcept.ru'/></p>
      <p></p>
    </div>
  );
}

export default HelpMain;
