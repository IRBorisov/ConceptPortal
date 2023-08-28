import { Link } from 'react-router-dom';

import { urls } from '../utils/constants';

function Footer() {
  return (
    <footer className='z-50 px-4 pt-2 pb-4 text-sm border-t-2 border-white select-none whitespace-nowrap clr-footer'>
      <div className='justify-center w-full mx-auto'>
        <div className='mb-2 text-center'>
          <Link className='mx-2 hover:underline' to='/library' tabIndex={-1}>Библиотека</Link> 
          <Link className='mx-2 hover:underline' to='/manuals' tabIndex={-1}>Справка</Link>
          <Link className='mx-2 hover:underline' to={urls.concept} tabIndex={-1}>Центр Концепт</Link>
          <Link className='mx-2 hover:underline' to='/manuals?topic=exteor' tabIndex={-1}>Экстеор</Link>
        </div>
        <div className=''>
          
          <p className='mt-0.5 text-center'>© 2023 ЦИВТ КОНЦЕПТ</p>
        </div>

      </div>
    </footer >
  );
}

export default Footer;
