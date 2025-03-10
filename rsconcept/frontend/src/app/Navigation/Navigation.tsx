import { IconLibrary2, IconManuals, IconNewItem2 } from '@/components/Icons';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useAppLayoutStore } from '@/stores/appLayout';

import { urls } from '../urls';

import { Logo } from './Logo';
import { NavigationButton } from './NavigationButton';
import { useConceptNavigation } from './NavigationContext';
import { ToggleNavigation } from './ToggleNavigation';
import { UserMenu } from './UserMenu';

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
        className='pl-2 pr-6 sm:pr-4 h-12 flex cc-shadow-border'
        style={{
          maxHeight: noNavigationAnimation ? '0rem' : '3rem',
          translate: noNavigationAnimation ? '0 -1.5rem' : '0'
        }}
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
