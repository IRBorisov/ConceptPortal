import { urls } from '../../utils/constants';
import { LibraryFilterStrategy } from '../../utils/models';
import TextURL from '../Common/TextURL';

function HelpMain() {
  return (
    <div className='flex flex-col w-full'>
      <h1>Портал</h1>
      <p className=''>Портал позволяет анализировать предметные области, формально записывать системы определений (концептуальные схемы) и синтезировать их с помощью математического аппарата родов структур.</p>
      <p className='mt-2'>Навигация по порталу осуществляется верхнюю панель или ссылки в "подвале" страницы. Их можно скрыть с помощью кнопки в правом верхнем углу.</p>
      <p className='mt-2'>В меню пользователя (правый верхний угол) доступно редактирование данных пользователя и изменение цветовой темы.</p>
      <p className='mt-4 mb-1 text-center'><b>Основные разделы</b></p>
      <li className='text-left'><TextURL text='Библиотека' href='/library' /> - все схемы доступные пользователю</li>
      <li className='text-left'><TextURL text='Общие схемы' href={`/library?filter=${LibraryFilterStrategy.COMMON}`} /> - общедоступные схемы и инструменты поиска и навигации по ним</li>
      <li className='text-left'><TextURL text='Мои схемы' href={`/library?filter=${LibraryFilterStrategy.PERSONAL}`} /> - отслеживаемые и редактируемые схемы. Основной рабочий раздел</li>
      <li className='text-left'><TextURL text='Профиль' href='/profile' /> - данные пользователя и смена пароля</li>
      <p className='mt-4 mb-1 text-center'><b>Поддержка</b></p>
      <p className=''>Портал разрабатывается <TextURL text='Центром Концепт' href={urls.concept}/> и является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={urls.gitrepo}/>.</p>
      <p className='mt-2'>Ждём Ваши пожелания по доработке, найденные ошибки и иные предложения по адресу <TextURL href={urls.mailportal} text='portal@acconcept.ru'/></p>
      <p></p>
    </div>
  );
}

export default HelpMain;
