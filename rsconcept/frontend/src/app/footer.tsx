'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function Footer() {
  const tx = useTx();
  return (
    <footer
      className={clsx(
        'z-navigation',
        'mx-auto',
        'px-3 py-2 flex flex-col items-center gap-1',
        'text-xs sm:text-sm select-none whitespace-nowrap text-muted-foreground bg-background'
      )}
    >
      <nav className='flex gap-3' aria-label={tx('footer.navAria')}>
        <TextURL text={tx('nav.bar.library')} href='/library' color='hover:text-foreground' />
        <TextURL text={tx('nav.bar.help')} href='/manuals' color='hover:text-foreground' />
        <TextURL
          text={tx('footer.link.conceptCenter')}
          href={external_urls.concept}
          color='hover:text-foreground'
        />
      </nav>

      <p>{tx('footer.copyright')}</p>
    </footer>
  );
}
