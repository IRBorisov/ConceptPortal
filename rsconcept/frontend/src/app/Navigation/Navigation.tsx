import clsx from 'clsx';
import { motion } from 'framer-motion';

import { IconLibrary2, IconManuals, IconNewItem2 } from '@/components/Icons';
import { CProps } from '@/components/props';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { animateNavigation } from '@/styling/animations';

import { urls } from '../urls';
import Logo from './Logo';
import NavigationButton from './NavigationButton';
import ToggleNavigationButton from './ToggleNavigationButton';
import UserMenu from './UserMenu';

function Navigation() {
  const router = useConceptNavigation();
  const { noNavigationAnimation } = useConceptOptions();

  const navigateHome = (event: CProps.EventMouse) => router.push(urls.home, event.ctrlKey || event.metaKey);
  const navigateLibrary = (event: CProps.EventMouse) => router.push(urls.library, event.ctrlKey || event.metaKey);
  const navigateHelp = (event: CProps.EventMouse) => router.push(urls.manuals, event.ctrlKey || event.metaKey);
  const navigateCreateNew = (event: CProps.EventMouse) =>
    router.push(urls.create_schema, event.ctrlKey || event.metaKey);

  return (
    <nav
      className={clsx(
        'z-navigation', // prettier: split lines
        'sticky top-0 left-0 right-0',
        'w-full',
        'clr-app',
        'select-none'
      )}
    >
      <ToggleNavigationButton />
      <motion.div
        className={clsx(
          'pl-2 pr-[0.9rem] h-[3rem] w-full', // prettier: split lines
          'flex',
          'cc-shadow-border'
        )}
        initial={false}
        animate={!noNavigationAnimation ? 'open' : 'closed'}
        variants={animateNavigation}
      >
        <div tabIndex={-1} className='flex items-center mr-auto cursor-pointer' onClick={navigateHome}>
          <Logo />
        </div>
        <div className='flex gap-1 py-[0.3rem]'>
          <NavigationButton text='Новая схема' icon={<IconNewItem2 size='1.5rem' />} onClick={navigateCreateNew} />
          <NavigationButton text='Библиотека' icon={<IconLibrary2 size='1.5rem' />} onClick={navigateLibrary} />
          <NavigationButton text='Справка' icon={<IconManuals size='1.5rem' />} onClick={navigateHelp} />
          <UserMenu />
        </div>
      </motion.div>
    </nav>
  );
}

export default Navigation;
