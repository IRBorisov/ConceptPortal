import { Link } from 'react-router-dom';
import { urls } from '../utils/constants';

function Footer() {
  return (
    <footer className='z-50 px-4 pt-2 pb-4 t border-t-2 clr-footer'>
      <div className='flex items-stretch justify-center w-full mx-auto'>
        <div className='px-4 underline'>
          <Link to='manuals' tabIndex={-1}>Справка</Link> <br/>
          <Link to='rsforms?filter=common' tabIndex={-1}>Библиотека КС</Link> <br/>
        </div>
        <div className='px-4 underline border-gray-400 border-x dark:border-gray-300'>
          <ul>
            <li>
              <a href={urls.concept} tabIndex={-1}>Центр Концепт</a>
            </li>
            <li>
              <a href={urls.exteor64} tabIndex={-1}>Exteor64bit</a>
            </li>
            <li>
              <a href={urls.exteor32} tabIndex={-1}>Exteor32bit</a>
            </li>
          </ul>
        </div>
        <div className='max-w-xl px-4 text-sm'>
          <p className='mt-0.5'>© 2023 ЦИВТ КОНЦЕПТ</p>
          <p>Данный инструмент работы с экспликациями концептуальных схем в родоструктурной форме является уникальной Российской разработкой и вобрал в себя разработки начиная с 1990-х годов</p>
        </div>
      </div>
    </footer >
  );
}

export default Footer;
