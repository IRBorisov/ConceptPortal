import clsx from 'clsx';

import { urls } from '@/utils/constants';

import TextURL from './Common/TextURL';

function Footer() {
  return (
  <footer tabIndex={-1}
    className={clsx(
      'w-full z-navigation',
      'px-4 py-2 flex flex-col items-center gap-1',
      'text-sm select-none whitespace-nowrap'
    )}
  >
    <div className='flex gap-3'>
      <TextURL text='Библиотека' href='/library' color='clr-footer'/>
      <TextURL text='Справка' href='/manuals' color='clr-footer'/>
      <TextURL text='Центр Концепт' href={urls.concept} color='clr-footer'/>
      <TextURL text='Экстеор' href='/manuals?topic=exteor' color='clr-footer'/>
    </div>
    <div>
      <p className='clr-footer'>© 2023 ЦИВТ КОНЦЕПТ</p>
    </div>
  </footer>);
}

export default Footer;