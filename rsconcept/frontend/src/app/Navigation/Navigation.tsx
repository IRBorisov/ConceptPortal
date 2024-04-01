import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FaSquarePlus } from 'react-icons/fa6';
import { IoLibrary } from 'react-icons/io5';

import { EducationIcon } from '@/components/Icons';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { animateNavigation } from '@/styling/animations';

import Logo from './Logo';
import NavigationButton from './NavigationButton';
import ToggleNavigationButton from './ToggleNavigationButton';
import UserMenu from './UserMenu';

function Navigation() {
  const router = useConceptNavigation();
  const { noNavigationAnimation } = useConceptOptions();

  const navigateHome = () => router.push('/');
  const navigateLibrary = () => router.push('/library');
  const navigateHelp = () => router.push('/manuals');
  const navigateCreateNew = () => router.push('/library/create');

  return (
    <nav
      className={clsx(
        'z-navigation', // prettier: split lines
        'sticky top-0 left-0 right-0',
        'clr-app',
        'select-none'
      )}
    >
      <ToggleNavigationButton />
      <motion.div
        className={clsx(
          'pl-2 pr-[0.9rem] h-[3rem]', // prettier: split lines
          'flex justify-between',
          'shadow-border'
        )}
        initial={false}
        animate={!noNavigationAnimation ? 'open' : 'closed'}
        variants={animateNavigation}
      >
        <div tabIndex={-1} className='flex items-center mr-2 cursor-pointer' onClick={navigateHome}>
          <Logo />
        </div>
        <div className='flex'>
          <NavigationButton
            text='Новая схема'
            title='Создать новую схему'
            icon={<FaSquarePlus size='1.5rem' />}
            onClick={navigateCreateNew}
          />
          <NavigationButton
            text='Библиотека'
            title='Список схем'
            icon={<IoLibrary size='1.5rem' />}
            onClick={navigateLibrary}
          />
          <NavigationButton
            text='Справка'
            title='Справочные материалы'
            icon={<EducationIcon />}
            onClick={navigateHelp}
          />
          <UserMenu />
        </div>
      </motion.div>
    </nav>
  );
}

export default Navigation;
