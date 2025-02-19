import { EmbedYoutube } from '@/components/View';
import { useWindowSize } from '@/hooks/useWindowSize';
import { external_urls, youtube } from '@/utils/constants';

import { Subtopics } from '../components/Subtopics';
import { HelpTopic } from '../models/helpTopic';

export function HelpRSLang() {
  const windowSize = useWindowSize();

  const videoHeight = (() => {
    const viewH = windowSize.height ?? 0;
    const viewW = windowSize.width ?? 0;
    const availableWidth = viewW - (windowSize.isSmall ? 35 : 310);
    return Math.min(1080, Math.max(viewH - 450, 300), Math.floor((availableWidth * 9) / 16));
  })();

  // prettier-ignore
  return (
  <div className='flex flex-col gap-4'>
    <div className='dense'>
      <h1>Родоструктурная экспликация концептуальных схем</h1>
      <p>Формальная запись (<i>экспликация</i>) концептуальных схем осуществляется с помощью языка родов структур.</p>
      <p>Для ознакомления с основами родов структур можно использовать следующие материалы:</p>
      <p>1. <a className='underline' href={external_urls.intro_video}>Видео: Краткое введение в мат. аппарат</a></p>
      <p>2. <a className='underline' href={external_urls.ponomarev}>Текст: Учебник И. Н. Пономарева</a></p>
      <p>3. <a className='underline' href={external_urls.full_course}>Видео: лекции для 4 курса (второй семестр 2022-23 год)</a></p>
    </div>
    <EmbedYoutube
      videoID={youtube.intro}
      pxHeight={videoHeight}
    />
    <div className='dense'>
      <Subtopics headTopic={HelpTopic.RSLANG} />
    </div>
  </div>);
}
