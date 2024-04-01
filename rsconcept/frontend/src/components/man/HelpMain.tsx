import TextURL from '@/components/ui/TextURL';
import { external_urls } from '@/utils/constants';

function HelpMain() {
  // prettier-ignore
  return (
  <div>
    <h1>Портал</h1>
    <p>Портал позволяет анализировать предметные области, формально записывать системы определений и синтезировать их с помощью математического аппарата родов структур</p>
    <h2>Основные разделы</h2>
    <li><TextURL text='Библиотека' href='/library' /> - библиотека концептуальных схем</li>
    <li><TextURL text='Профиль' href='/profile' /> - данные пользователя и смена пароля</li>
    
    <h2>Навигация</h2>
    <p>Навигационную панель можно скрыть с помощью кнопки в правом верхнем углу</p>
    <p>В меню пользователя (правый угол) доступно редактирование пользователя и изменение цветовой темы</p>

    <h2>Поддержка</h2>
    <p>Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept}/> и является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={external_urls.git_repo}/></p>
    <p>Ваши пожелания по доработке, найденные ошибки и иные предложения можно направлять по email: <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru'/></p>
  </div>);
}

export default HelpMain;
