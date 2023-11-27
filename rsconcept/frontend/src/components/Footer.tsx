import { Link } from 'react-router-dom';

import { urls } from '../utils/constants';

function Footer() {
  return (
    <footer className='px-4 py-2 text-sm select-none z-navigation whitespace-nowrap clr-footer'>
      <div className='justify-center w-full mx-auto'>
        <div className='mb-2 text-center'>
          <Link className='mx-2 hover:underline' to='/library' tabIndex={-1}>Библиотека</Link> 
          <Link className='mx-2 hover:underline' to='/manuals' tabIndex={-1}>Справка</Link>
          <Link className='mx-2 hover:underline' to={urls.concept} tabIndex={-1}>Центр Концепт</Link>
          <Link className='mx-2 hover:underline' to='/manuals?topic=exteor' tabIndex={-1}>Экстеор</Link>
        </div>
        <div>
          <p className='mt-0.5 text-center'>© 2023 ЦИВТ КОНЦЕПТ</p>
        </div>

      </div>
    </footer >
  );
}

export default Footer;
