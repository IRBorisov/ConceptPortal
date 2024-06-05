import clsx from 'clsx';

import { useConceptOptions } from '@/context/OptionsContext';
import { external_urls } from '@/utils/constants';

import TextURL from '../components/ui/TextURL';

function Footer() {
  const { noNavigation, noFooter } = useConceptOptions();
  if (noNavigation || noFooter) {
    return null;
  }
  return (
    <footer
      className={clsx(
        'z-navigation',
        'mx-auto',
        'sm:px-4 sm:py-2 flex flex-col items-center gap-1',
        'text-xs sm:text-sm select-none whitespace-nowrap'
      )}
    >
      <div className='flex gap-3'>
        <TextURL text='Библиотека' href='/library' color='clr-footer' />
        <TextURL text='Справка' href='/manuals' color='clr-footer' />
        <TextURL text='Центр Концепт' href={external_urls.concept} color='clr-footer' />
        <TextURL text='Экстеор' href='/manuals?topic=exteor' color='clr-footer' />
      </div>
      <div>
        <p className='clr-footer'>© 2024 ЦИВТ КОНЦЕПТ</p>
      </div>
    </footer>
  );
}

export default Footer;
