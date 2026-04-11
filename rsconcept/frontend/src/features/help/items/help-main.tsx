import { TextURL } from '@/components/control';
import { external_urls, prefixes } from '@/utils/constants';

import { LinkTopic } from '../components/link-topic';
import { TopicItem } from '../components/topic-item';
import { HelpTopic } from '../models/help-topic';

export function HelpMain() {
  return (
    <div className='text-justify'>
      <h1>Портал</h1>
      <p>
        Портал предоставляет мощные инструменты для формального анализа и моделирования предметных областей, обеспечивая
        структурированное описание и глубокую проработку понятий с помощью{' '}
        <LinkTopic text='Родов структур' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Создавайте <LinkTopic text='Концептуальные схемы' topic={HelpTopic.CC_SYSTEM} /> — системы определений,
        состоящие из отдельных <LinkTopic text='Конституент' topic={HelpTopic.CC_CONSTITUENTA} /> с четкими формальными
        определениями и структурой. Визуализируйте и исследуйте структуру определений и граф связей понятий.
      </p>
      <p>
        Объединяйте отдельные схемы в масштабные{' '}
        <LinkTopic text='Операционные схемы синтеза' topic={HelpTopic.CC_OSS} /> для работы с комплексными предметными
        областями.
      </p>
      <p>
        Интегрируйте формальные определения с данными из предметных источников, создавая{' '}
        <LinkTopic text='Концептуальные модели' topic={HelpTopic.CC_RSMODEL} />. Экспериментируйте с формальными
        определениями, автоматически формируйте их значения для любой предметной области.
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

      <details className='mt-2'>
        <summary className='text-center font-semibold'>Лицензирование и раскрытие информации</summary>
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
      </details>

      <h2 className='mt-2'>Поддержка</h2>
      <p>
        Портал разрабатывается <TextURL text='Центром Концепт' href={external_urls.concept} /> и вобрал в себя{' '}
        <LinkTopic text='многолетнюю работу' topic={HelpTopic.INFO_CONTRIB} /> над средствами экспликации концептуальных
        схем.
      </p>
      <p>Портал поддерживает актуальные версии браузеров Chrome, Firefox, Safari, включая мобильные устройства.</p>
      <p>
        Ваши пожелания по доработке, найденные ошибки и иные предложения направляйте на email:{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </div>
  );
}
