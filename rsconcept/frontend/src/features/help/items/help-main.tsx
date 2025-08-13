import { TextURL } from '@/components/control';
import { IconVideo } from '@/components/icons';
import { external_urls, prefixes } from '@/utils/constants';

import { LinkTopic } from '../components/link-topic';
import { TopicItem } from '../components/topic-item';
import { HelpTopic } from '../models/help-topic';

export function HelpMain() {
  return (
    <div className='text-justify'>
      <h1>Портал</h1>
      <p>
        Портал позволяет анализировать предметные области, формально записывать системы определений и синтезировать их с
        помощью математического аппарата <LinkTopic text='Родов структур' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Такие системы называются <LinkTopic text='Концептуальными схемами' topic={HelpTopic.CC_SYSTEM} /> и состоят из
        отдельных <LinkTopic text='Конституент' topic={HelpTopic.CC_CONSTITUENTA} />, которым даны формальные
        определения. Концептуальные схемы могут связываться путем синтеза в{' '}
        <LinkTopic text='Операционной схеме синтеза' topic={HelpTopic.CC_OSS} />.
      </p>
      <p>
        Значок <IconVideo className='inline-icon' /> при нажатии отображает видео о различных темах и подробностях
        работы Портала. Просмотр видео доступен на Youtube и ВКонтакте.
      </p>

      <details>
        <summary className='text-center font-semibold'>Разделы Справки</summary>
        <ul>
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
        </ul>
      </details>

      <h2>Лицензирование и раскрытие информации</h2>
      <ul>
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
      </ul>

      <h2>Поддержка</h2>
      <p>
        Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept} /> и вобрал в себя{' '}
        <LinkTopic text='многолетнюю работу' topic={HelpTopic.INFO_CONTRIB} /> над средствами экспликации.
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
