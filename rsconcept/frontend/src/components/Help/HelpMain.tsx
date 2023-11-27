import { urls } from '../../utils/constants';
import TextURL from '../Common/TextURL';

function HelpMain() {
  return (
  <div className='flex flex-col w-full text-left'>
    <h1>Портал</h1>
    <p className=''>Портал позволяет анализировать предметные области, формально записывать системы определений (концептуальные схемы) и синтезировать их с помощью математического аппарата родов структур.</p>
    <p className='mt-4 mb-1 text-center'><b>Основные разделы</b></p>
    <li><TextURL text='Библиотека' href='/library' /> - библиотека концептуальных схем. Доступны сортировка, поиск и фильтрация</li>
    <li><TextURL text='Профиль' href='/profile' /> - данные пользователя и смена пароля</li>
    
    <p className='mt-4 mb-1 text-center'><b>Навигация</b></p>
    <p>Навигационную панель можно скрыть/отобразить с помощью кнопки в правом верхнем углу.</p>
    <p>В меню пользователя (правый верхний угол) доступно редактирование данных пользователя и изменение цветовой темы.</p>

    <p className='mt-4 mb-1 text-center'><b>Поддержка</b></p>
    <p>Портал разрабатывается <TextURL text='Центром Концепт' href={urls.concept}/> и является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={urls.gitrepo}/>.</p>
    <p>Ваши пожелания по доработке, найденные ошибки и иные предложения можно направлять по email: <TextURL href={urls.mailportal} text='portal@acconcept.ru'/></p>
  </div>);
}

export default HelpMain;
