'use client';

import clsx from 'clsx';

import { Logo } from '@/app/navigation/logo';
import { NavigationButton } from '@/app/navigation/navigation-button';
import { useConceptNavigation } from '@/app/navigation/navigation-context';
import { ToggleNavigation } from '@/app/navigation/toggle-navigation';
import { urls } from '@/app/urls';

import { IconLibrary2, IconManuals, IconSandbox } from '@/components/icons';
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

  function navigateSandbox(event: React.MouseEvent<Element>) {
    push({ path: urls.sandbox, newTab: event.ctrlKey || event.metaKey });
  }

  function navigateLibrary(event: React.MouseEvent<Element>) {
    push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  }

  function navigateHelp(event: React.MouseEvent<Element>) {
    push({ path: urls.manuals, newTab: event.ctrlKey || event.metaKey });
  }

  return (
    <nav className='z-navigation sticky top-0 left-0 right-0 select-none bg-background' inert={activeDialog !== null}>
      <ToggleNavigation />
      <div
        className={clsx(
          'pl-2 sm:pr-4 h-12 flex gap-2 justify-between cc-shadow-border',
          'transition-[max-height,translate] ease-bezier duration-move',
          noNavigationAnimation ? '-translate-y-6 max-h-0' : 'max-h-12'
        )}
      >
        <div className='cc-fade-in flex items-center shrink-0' onClick={!size.isSmall ? navigateHome : undefined}>
          <Logo />
        </div>

        <div className='flex gap-2 items-center pr-2 shrink-0'>
          <NavigationButton
            text='Песочница'
            title='Открыть песочницу'
            icon={<IconSandbox size='1.5rem' />}
            onClick={navigateSandbox}
            className={clsx('bg-muted/40 text-foreground')}
          />
          <NavigationButton
            text='Библиотека'
            title='Открыть библиотеку'
            icon={<IconLibrary2 size='1.5rem' />}
            onClick={navigateLibrary}
          />
          <NavigationButton
            text='Справка'
            title='Открыть справку'
            icon={<IconManuals size='1.5rem' />}
            onClick={navigateHelp}
          />
        </div>
      </div>
    </nav>
  );
}
