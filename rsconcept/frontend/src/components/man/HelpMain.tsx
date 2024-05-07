import { urls } from '@/app/urls';
import TextURL from '@/components/ui/TextURL';
import { HelpTopic } from '@/models/miscellaneous';
import { external_urls } from '@/utils/constants';

function HelpMain() {
  // prettier-ignore
  return (
  <div>
    <h1>Портал</h1>
    <p>Портал позволяет анализировать предметные области, формально записывать системы определений и синтезировать их с помощью математического <TextURL text='аппарата родов структур' href={urls.help_topic(HelpTopic.RSLANG)}/></p>
    <p>Такие системы называются <b>Концептуальными схемами</b> и состоят из отдельных <TextURL text='Конституент' href={urls.help_topic(HelpTopic.CST_ATTRIBUTES)}/>, обладающих уникальными обозначениями и формальными определениями</p>
    <br/>

    <h2>Основные разделы</h2>
    <li><TextURL text='Библиотека' href={urls.library} /> – библиотека концептуальных схем</li>
    <li><TextURL text='Справка' href={urls.manuals} /> – справочные материалы</li>
    <li><TextURL text='Профиль' href={urls.profile} /> – данные пользователя и смена пароля</li>
    <br/>
    
    <h2>Навигация и настройки</h2>
    <li>Навигационную панель можно скрыть с помощью кнопки в правом верхнем углу</li>
    <li>В меню пользователя доступен ряд настроек и управление активным профилем</li>
    <br/>

    <h2>Лицензирование и раскрытие информации</h2>
    <li>Пользователи Портала сохраняют авторские права на создаваемый ими контент</li>
    <li>Политика обработки данных доступна по <TextURL text='ссылке' href={urls.help_topic(HelpTopic.PRIVACY)} /></li>
    <li>Портал является проектом с открытым исходным кодом, доступным на <TextURL text='Github' href={external_urls.git_repo}/></li>
    <li>Данный сайт использует доменное имя и серверные мощности <TextURL text='Центра Концепт' href={external_urls.concept}/></li>
    <br/>

    <h2>Поддержка</h2>
    <p>Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept}/></p>
    <p>Ваши пожелания по доработке, найденные ошибки и иные предложения можно направлять по email: <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru'/></p>
  </div>);
}

export default HelpMain;
