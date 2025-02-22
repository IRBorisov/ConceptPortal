import clsx from 'clsx';

import { IconLibrary2, IconManuals, IconNewItem2 } from '@/components/Icons';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useAppLayoutStore } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

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

  const navigateHome = (event: React.MouseEvent<Element>) => router.push(urls.home, event.ctrlKey || event.metaKey);
  const navigateLibrary = (event: React.MouseEvent<Element>) =>
    router.push(urls.library, event.ctrlKey || event.metaKey);
  const navigateHelp = (event: React.MouseEvent<Element>) => router.push(urls.manuals, event.ctrlKey || event.metaKey);
  const navigateCreateNew = (event: React.MouseEvent<Element>) =>
    router.push(urls.create_schema, event.ctrlKey || event.metaKey);

  return (
    <nav
      className={clsx(
        'z-navigation', //
        'sticky top-0 left-0 right-0',
        'select-none',
        'bg-prim-100'
      )}
    >
      <ToggleNavigation />
      <div
        className={clsx(
          'pl-2 pr-[1.5rem] sm:pr-[0.9rem] h-[3rem]', //
          'flex',
          'cc-shadow-border'
        )}
        style={{
          willChange: 'max-height, translate',
          transitionProperty: 'max-height, translate',
          transitionDuration: `${PARAMETER.moveDuration}ms`,
          maxHeight: noNavigationAnimation ? '0rem' : '3rem',
          translate: noNavigationAnimation ? '0 -1.5rem' : '0'
        }}
      >
        <div
          tabIndex={-1}
          className={clsx('flex items-center mr-auto', !size.isSmall && 'cursor-pointer')}
          onClick={!size.isSmall ? navigateHome : undefined}
        >
          <Logo />
        </div>
        <div className='flex gap-1 py-[0.3rem]'>
          <NavigationButton text='Новая схема' icon={<IconNewItem2 size='1.5rem' />} onClick={navigateCreateNew} />
          <NavigationButton text='Библиотека' icon={<IconLibrary2 size='1.5rem' />} onClick={navigateLibrary} />
          <NavigationButton text='Справка' icon={<IconManuals size='1.5rem' />} onClick={navigateHelp} />

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
