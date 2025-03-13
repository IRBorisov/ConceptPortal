import clsx from 'clsx';

import { IconLibrary2, IconManuals, IconNewItem2 } from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAppLayoutStore } from '@/stores/app-layout';

import { urls } from '../urls';

import { Logo } from './logo';
import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';
import { ToggleNavigation } from './toggle-navigation';
import { UserMenu } from './user-menu';

export function Navigation() {
  const router = useConceptNavigation();
  const size = useWindowSize();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);

  const navigateHome = (event: React.MouseEvent<Element>) =>
    router.push({ path: urls.home, newTab: event.ctrlKey || event.metaKey });
  const navigateLibrary = (event: React.MouseEvent<Element>) =>
    router.push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  const navigateHelp = (event: React.MouseEvent<Element>) =>
    router.push({ path: urls.manuals, newTab: event.ctrlKey || event.metaKey });
  const navigateCreateNew = (event: React.MouseEvent<Element>) =>
    router.push({ path: urls.create_schema, newTab: event.ctrlKey || event.metaKey });

  return (
    <nav className='z-navigation sticky top-0 left-0 right-0 select-none bg-prim-100'>
      <ToggleNavigation />
      <div
        className={clsx(
          'pl-2 pr-6 sm:pr-4 h-12 flex cc-shadow-border',
          'transition-[max-height,translate] ease-bezier duration-(--duration-move)',
          noNavigationAnimation ? '-translate-y-6 max-h-0' : 'max-h-12'
        )}
      >
        <div className='flex items-center mr-auto cursor-pointer' onClick={!size.isSmall ? navigateHome : undefined}>
          <Logo />
        </div>
        <div className='flex gap-2 items-center'>
          <NavigationButton text='Новая схема' icon={<IconNewItem2 size='1.5rem' />} onClick={navigateCreateNew} />
          <NavigationButton text='Библиотека' icon={<IconLibrary2 size='1.5rem' />} onClick={navigateLibrary} />
          <NavigationButton text='Справка' icon={<IconManuals size='1.5rem' />} onClick={navigateHelp} />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
