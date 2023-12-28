import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import { urls } from '@/utils/constants';

import TextURL from './Common/TextURL';

function Footer() {
  const { noNavigation, noFooter } = useConceptTheme();
  if (noNavigation || noFooter) {
    return null;
  }
  return (
    <footer
      tabIndex={-1}
      className={clsx(
        'z-navigation',
        'px-4 py-2 flex flex-col items-center gap-1',
        'text-sm select-none whitespace-nowrap'
      )}
    >
      <div className='flex gap-3'>
        <TextURL text='Библиотека' href='/library' color='clr-footer' />
        <TextURL text='Справка' href='/manuals' color='clr-footer' />
        <TextURL text='Центр Концепт' href={urls.concept} color='clr-footer' />
        <TextURL text='Экстеор' href='/manuals?topic=exteor' color='clr-footer' />
      </div>
      <div>
        <p className='clr-footer'>© 2024 ЦИВТ КОНЦЕПТ</p>
      </div>
    </footer>
  );
}

export default Footer;
