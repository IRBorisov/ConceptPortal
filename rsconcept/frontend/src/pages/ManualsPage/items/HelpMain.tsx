import { urls } from '@/app/urls';
import { IconLibrary2, IconManuals, IconUser2 } from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import TextURL from '@/components/ui/TextURL';
import { HelpTopic } from '@/models/miscellaneous';
import { external_urls, prefixes } from '@/utils/constants';

import TopicItem from '../TopicItem';

function HelpMain() {
  return (
    <div className='text-justify'>
      <h1>Портал</h1>
      <p>
        Портал позволяет анализировать предметные области, формально записывать системы определений и синтезировать их с
        помощью математического аппарата <LinkTopic text='Родов структур' topic={HelpTopic.RSLANG} />
      </p>
      <p>
        Такие системы называются <LinkTopic text='Концептуальными схемами' topic={HelpTopic.CC_SYSTEM} /> и состоят из
        отдельных <LinkTopic text='Конституент' topic={HelpTopic.CC_CONSTITUENTA} />, обладающих уникальными
        обозначениями и формальными определениями. Концептуальные схемы могут быть получены в рамках операций синтеза в{' '}
        <LinkTopic text='Операционной схеме синтеза' topic={HelpTopic.CC_OSS} />.
      </p>

      <h2>Разделы Портала</h2>
      <li>
        <IconLibrary2 size='1.25rem' className='inline-icon' /> <TextURL text='Библиотека' href={urls.library} /> –
        библиотека концептуальных схем
      </li>
      <li>
        <IconManuals size='1.25rem' className='inline-icon' /> <TextURL text='Справка' href={urls.manuals} /> –
        справочные материалы
      </li>
      <li>
        <IconUser2 size='1.25rem' className='inline-icon' /> <TextURL text='Профиль' href={urls.profile} /> – данные
        пользователя и смена пароля
      </li>

      <h2>Разделы Справки</h2>
      {[
        HelpTopic.THESAURUS,
        HelpTopic.INTERFACE,
        HelpTopic.CONCEPTUAL,
        HelpTopic.RSLANG,
        HelpTopic.TERM_CONTROL,
        HelpTopic.ACCESS,
        HelpTopic.VERSIONS,
        HelpTopic.INFO,
        HelpTopic.EXTEOR
      ].map(topic => (
        <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
      ))}

      <h2>Лицензирование и раскрытие информации</h2>
      <li>Пользователи Портала сохраняют авторские права на создаваемый ими контент</li>
      <li>
        Политика обработки данных доступна по <LinkTopic text='ссылке' topic={HelpTopic.INFO_PRIVACY} />
      </li>
      <li>
        Портал является проектом с открытым исходным кодом, доступным на{' '}
        <TextURL text='Github' href={external_urls.git_portal} />
      </li>
      <li>
        Данный сайт использует доменное имя и серверные мощности{' '}
        <TextURL text='Центра Концепт' href={external_urls.concept} />
      </li>

      <h2>Поддержка</h2>
      <p>
        Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept} />
      </p>
      <p>
        Портал поддерживает актуальные версии браузеров Chrome, Firefox, Safari, включая мобильные устройства.
        Убедитесь, что используете последнюю версию браузера в случае возникновения визуальных ошибок или проблем с
        производительностью.
      </p>
      <p>
        Ваши пожелания по доработке, найденные ошибки и иные предложения можно направлять на email:{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </div>
  );
}

export default HelpMain;
