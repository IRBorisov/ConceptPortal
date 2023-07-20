import { urls } from '../utils/constants';

function ManualsPage() {
  return (
    <div className='flex flex-col w-full py-2'>
      <b>Справочники находятся в разработке</b>
      <p>Для ознакомления с основами родов структур можно использовать следующие материалы:</p>
      <ul>
        <li>
          1. <a className='underline' href={urls.intro_video}>Краткое введение в мат. аппарат</a>
        </li>
        <li>
          2. <a className='underline' href={urls.full_course}>Видео лекций по мат. аппарату для 4 курса (второй семестр 2022-23 год)</a>
        </li>
        <li>
          3. <a className='underline' href={urls.ponomarev}>Учебник И. Н. Пономарева</a>
        </li>
      </ul>
    </div>
  );
}

export default ManualsPage;