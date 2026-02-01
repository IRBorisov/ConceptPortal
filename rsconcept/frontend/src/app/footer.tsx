import clsx from 'clsx';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function Footer() {
  return (
    <footer
      className={clsx(
        'z-navigation',
        'mx-auto',
        'px-3 py-2 flex flex-col items-center gap-1',
        'text-xs sm:text-sm select-none whitespace-nowrap text-muted-foreground bg-background'
      )}
    >
      <nav className='flex gap-3' aria-label='Вторичная навигация'>
        <TextURL text='Библиотека' href='/library' color='hover:text-foreground' />
        <TextURL text='Справка' href='/manuals' color='hover:text-foreground' />
        <TextURL text='Центр Концепт' href={external_urls.concept} color='hover:text-foreground' />
        <TextURL text='Экстеор' href='/manuals?topic=exteor' color='hover:text-foreground' />
      </nav>

      <p>© 2026 ЦИВТ КОНЦЕПТ</p>
    </footer>
  );
}
