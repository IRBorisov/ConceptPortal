import { urls } from '@/app/urls';
import { IconLibrary2, IconManuals, IconUser2 } from '@/components/Icons';
import TextURL from '@/components/ui/TextURL';
import { HelpTopic } from '@/models/miscellaneous';
import { external_urls, prefixes } from '@/utils/constants';

import LinkTopic from '../../../components/ui/LinkTopic';
import TopicItem from '../TopicItem';

function HelpPortal() {
  return (
    <div>
      <h1>Портал</h1>
      <p>
        Портал позволяет анализировать предметные области, формально записывать системы определений и синтезировать их с
        помощью математического аппарата <LinkTopic text='Родов структур' topic={HelpTopic.RSLANG} />
      </p>
      <p>
        Такие системы называются <b>Концептуальными схемами</b> и состоят из отдельных{' '}
        <LinkTopic text='Конституент' topic={HelpTopic.CC_CONSTITUENTA} />, обладающих уникальными обозначениями и
        формальными определениями
      </p>
      <br />

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
      <br />

      <h2>Разделы Справки</h2>
      {[
        HelpTopic.INFO,
        HelpTopic.INTERFACE,
        HelpTopic.CONCEPTUAL,
        HelpTopic.RSLANG,
        HelpTopic.TERM_CONTROL,
        HelpTopic.ACCESS,
        HelpTopic.VERSIONS,
        HelpTopic.EXTEOR
      ].map(topic => (
        <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
      ))}
      <br />

      <h2>Лицензирование и раскрытие информации</h2>
      <li>Пользователи Портала сохраняют авторские права на создаваемый ими контент</li>
      <li>
        Политика обработки данных доступна по <LinkTopic text='ссылке' topic={HelpTopic.INFO_PRIVACY} />
      </li>
      <li>
        Портал является проектом с открытым исходным кодом, доступным на{' '}
        <TextURL text='Github' href={external_urls.git_repo} />
      </li>
      <li>
        Данный сайт использует доменное имя и серверные мощности{' '}
        <TextURL text='Центра Концепт' href={external_urls.concept} />
      </li>
      <br />

      <h2>Поддержка</h2>
      <p>
        Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept} />
      </p>
      <p>
        Ваши пожелания по доработке, найденные ошибки и иные предложения можно направлять по email:{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </div>
  );
}

export default HelpPortal;
