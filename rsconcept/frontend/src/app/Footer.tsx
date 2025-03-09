import clsx from 'clsx';

import { TextURL } from '@/components/Control';
import { external_urls } from '@/utils/constants';

export function Footer() {
  return (
    <footer
      className={clsx(
        'z-navigation',
        'mx-auto',
        'px-3 py-2 flex flex-col items-center gap-1',
        'text-xs sm:text-sm select-none whitespace-nowrap text-prim-600 bg-prim-100'
      )}
    >
      <nav className='flex gap-3' aria-label='Вторичная навигация'>
        <TextURL text='Библиотека' href='/library' color='' />
        <TextURL text='Справка' href='/manuals' color='' />
        <TextURL text='Центр Концепт' href={external_urls.concept} color='' />
        <TextURL text='Экстеор' href='/manuals?topic=exteor' color='' />
      </nav>

      <p>© 2024 ЦИВТ КОНЦЕПТ</p>
    </footer>
  );
}
