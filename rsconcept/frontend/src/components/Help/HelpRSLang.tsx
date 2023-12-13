import { useMemo } from 'react';

import EmbedYoutube from '@/components/Common/EmbedYoutube';
import useWindowSize from '@/hooks/useWindowSize';
import { urls, youtube } from '@/utils/constants';

const OPT_VIDEO_H = 1080;

function HelpRSLang() {
  const windowSize = useWindowSize();

  const videoHeight = useMemo(
  () => {
    const viewH = windowSize.height ?? 0;
    const viewW = windowSize.width ?? 0;
    return Math.min(OPT_VIDEO_H, viewH - 370, Math.floor((viewW - 250)*9/16));
  }, [windowSize]);

  return (
  <div className='flex flex-col w-full gap-4'>
    <div>
      <h1>Родоструктурная экспликация концептуальных схем</h1>
      <p>Формальная запись (<i>экспликация</i>) концептуальных схем осуществляется с помощью языка родов структур.</p>
      <p>Данный математический аппарат основан на аксиоматической теории множеств Цермелло-Френкеля и аппарате родов структур Н.Бурбаки.</p>
      <p>Для ознакомления с основами родов структур можно использовать следующие материалы:</p>
      <ul>
        <li>1. <a className='underline' href={urls.intro_video}>Видео: Краткое введение в мат. аппарат</a></li>
        <li>2. <a className='underline' href={urls.ponomarev}>Текст: Учебник И. Н. Пономарева</a></li>
        <li>3. <a className='underline' href={urls.full_course}>Видео: лекции для 4 курса (второй семестр 2022-23 год)</a></li>
      </ul>
    </div>
    <div className='justify-center hidden w-full md:flex fleex-col'>
    <EmbedYoutube
      videoID={youtube.intro}
      pxHeight={videoHeight}
    />
    </div>
  </div>);
}

export default HelpRSLang;