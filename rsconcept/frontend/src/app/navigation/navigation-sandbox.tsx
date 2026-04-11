'use client';

import clsx from 'clsx';

import { Logo } from '@/app/navigation/logo';
import { NavigationButton } from '@/app/navigation/navigation-button';
import { useConceptNavigation } from '@/app/navigation/navigation-context';
import { ToggleNavigation } from '@/app/navigation/toggle-navigation';
import { urls } from '@/app/urls';

import { IconLibrary2, IconManuals } from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

export function NavigationSandbox() {
  const { push } = useConceptNavigation();
  const size = useWindowSize();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const activeDialog = useDialogsStore(state => state.active);

  function navigateHome(event: React.MouseEvent<Element>) {
    push({ path: urls.home, newTab: event.ctrlKey || event.metaKey });
  }

  function navigateLibrary(event: React.MouseEvent<Element>) {
    push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  }

  function navigateHelp(event: React.MouseEvent<Element>) {
    push({ path: urls.manuals, newTab: event.ctrlKey || event.metaKey });
  }

  return (
    <nav
      className='z-navigation sticky top-0 left-0 right-0 select-none bg-background/95 backdrop-blur-xl'
      inert={activeDialog !== null}
    >
      <ToggleNavigation />
      <div
        className={clsx(
          'relative isolate',
          'pl-2 sm:pr-4 h-12 flex gap-2 justify-between',
          'cc-shadow-border',
          'transition-[max-height,translate] ease-bezier duration-move',
          noNavigationAnimation ? '-translate-y-6 max-h-0' : 'max-h-12'
        )}
      >
        <div className='absolute top-0 w-full h-full overflow-hidden'>
          <div
            aria-hidden
            className={clsx(
              'absolute -left-8 -top-10 h-24 w-40',
              'rounded-full blur-3xl',
              'bg-accent-blue/30 dark:bg-accent-blue/60',
              'pointer-events-none '
            )}
          />
          <div
            aria-hidden
            className={clsx(
              'absolute right-8 -top-8 h-20 w-32',
              'rounded-full blur-3xl',
              'bg-accent-purple/20 dark:bg-accent-purple/60',
              'pointer-events-none '
            )}
          />
        </div>

        <div
          className='cc-fade-in relative z-10 flex items-center shrink-0'
          onClick={!size.isSmall ? navigateHome : undefined}
        >
          <Logo />
        </div>

        <div className='relative z-10 flex gap-2 items-center pr-2 shrink-0'>
          <NavigationButton text='Библиотека' icon={<IconLibrary2 size='1.5rem' />} onClick={navigateLibrary} />
          <NavigationButton text='Справка' icon={<IconManuals size='1.5rem' />} onClick={navigateHelp} />
        </div>
      </div>
    </nav>
  );
}
