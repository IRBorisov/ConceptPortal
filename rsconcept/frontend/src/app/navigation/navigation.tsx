import clsx from 'clsx';

import { IconLibrary2, IconManuals, IconNewItem2 } from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

import { urls } from '../urls';

import { Logo } from './logo';
import { MenuAI } from './menu-ai';
import { MenuUser } from './menu-user';
import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';
import { ToggleNavigation } from './toggle-navigation';

export function Navigation() {
  const { push } = useConceptNavigation();
  const size = useWindowSize();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const activeDialog = useDialogsStore(state => state.active);

  const navigateHome = (event: React.MouseEvent<Element>) =>
    push({ path: urls.home, newTab: event.ctrlKey || event.metaKey });
  const navigateLibrary = (event: React.MouseEvent<Element>) =>
    push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  const navigateHelp = (event: React.MouseEvent<Element>) =>
    push({ path: urls.manuals, newTab: event.ctrlKey || event.metaKey });
  const navigateCreateNew = (event: React.MouseEvent<Element>) =>
    push({ path: urls.create_schema, newTab: event.ctrlKey || event.metaKey });

  return (
    <nav className='z-navigation sticky top-0 left-0 right-0 select-none bg-background' inert={activeDialog !== null}>
      <ToggleNavigation />
      <div
        className={clsx(
          'pl-2 sm:pr-4 h-12 flex cc-shadow-border',
          'transition-[max-height,translate] ease-bezier duration-move',
          noNavigationAnimation ? '-translate-y-6 max-h-0' : 'max-h-12'
        )}
      >
        <div className='flex items-center mr-auto cursor-pointer' onClick={!size.isSmall ? navigateHome : undefined}>
          <Logo />
        </div>
        <div className='flex gap-2 items-center pr-2'>
          <NavigationButton text='Новая схема' icon={<IconNewItem2 size='1.5rem' />} onClick={navigateCreateNew} />
          <NavigationButton text='Библиотека' icon={<IconLibrary2 size='1.5rem' />} onClick={navigateLibrary} />
          <NavigationButton text='Справка' icon={<IconManuals size='1.5rem' />} onClick={navigateHelp} />

          <MenuAI />
          <MenuUser />
        </div>
      </div>
    </nav>
  );
}
