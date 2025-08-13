import { external_urls, videos } from '@/utils/constants';

import { BadgeVideo } from '../components/badge-video';
import { Subtopics } from '../components/subtopics';
import { HelpTopic } from '../models/help-topic';

export function HelpRSLang() {
  // prettier-ignore
  return (
  <div className='flex flex-col gap-4'>
    <div className='dense'>
      <h1>Родоструктурная экспликация концептуальных схем</h1>
      <p>Формальная запись (<i>экспликация</i>) концептуальных схем осуществляется с помощью языка родов структур.</p>
      <p>Для ознакомления с основами родов структур можно использовать следующие материалы:</p>
      <p>1. <BadgeVideo className='inline-icon' video={videos.explication} /> Видео: Краткое введение в мат. аппарат</p>
      <p>2. <a className='underline' href={external_urls.ponomarev}>Текст: Учебник И. Н. Пономарева</a></p>
      <p>3. <a className='underline' href={external_urls.full_course}>Видео: лекции для 4 курса (второй семестр 2022-23 год)</a></p>
    </div>
    <div className='dense'>
      <Subtopics headTopic={HelpTopic.RSLANG} />
    </div>
  </div>);
}
