import { urls } from '../utils/constants';
import TextURL from './Common/TextURL';

function Footer() {
  return (
  <footer tabIndex={-1} className='flex flex-col items-center w-full gap-1 px-4 py-2 text-sm select-none z-navigation whitespace-nowrap'>
    <div className='flex gap-3 text-center'>
      <TextURL text='Библиотека' href='/library' color='clr-footer'/>
      <TextURL text='Справка' href='/manuals' color='clr-footer'/>
      <TextURL text='Центр Концепт' href={urls.concept} color='clr-footer'/>
      <TextURL text='Экстеор' href='/manuals?topic=exteor' color='clr-footer'/>
    </div>
    <div>
      <p className='mt-0.5 text-center clr-footer'>© 2023 ЦИВТ КОНЦЕПТ</p>
    </div>
  </footer>);
}

export default Footer;