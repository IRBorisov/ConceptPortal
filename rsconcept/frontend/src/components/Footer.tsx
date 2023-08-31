import { Link } from 'react-router-dom';

import { urls } from '../utils/constants';

function Footer() {
  return (
    <footer className='z-50 px-4 py-2 text-sm select-none whitespace-nowrap clr-footer'>
      <div className='flex items-stretch justify-center w-full gap-4 mx-auto'>
        <div className='underline'>
          <Link to='/library' tabIndex={-1}>Библиотека</Link> <br/>
          <Link to='/manuals' tabIndex={-1}>Справка</Link> <br/>
        </div>
        <div className=''>
          <p className='w-full text-center underline'><a href={urls.concept} tabIndex={-1} >Центр Концепт</a></p>
          <p className='mt-0.5 text-center'>© 2023 ЦИВТ КОНЦЕПТ</p>
        </div>
        <div className='flex flex-col underline'>
          <Link to='/manuals?topic=exteor' tabIndex={-1}>Экстеор</Link>
        </div>
        
      </div>
    </footer >
  );
}

export default Footer;
