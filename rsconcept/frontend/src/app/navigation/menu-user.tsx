'use client';

import { Suspense } from 'react';

import { useDropdown } from '@/components/dropdown';
import { Loader } from '@/components/loader';

import { urls } from '../urls';

import { useConceptNavigation } from './navigation-context';
import { UserButton } from './user-button';
import { UserDropdown } from './user-dropdown';

export function MenuUser() {
  const router = useConceptNavigation();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();
  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='flex items-center justify-start relative h-full'>
      <Suspense fallback={<Loader circular scale={1.5} />}>
        <UserButton
          onLogin={() => router.push({ path: urls.login, force: true })}
          onClickUser={toggleMenu}
          isOpen={isMenuOpen}
        />
      </Suspense>
      <UserDropdown isOpen={isMenuOpen} hideDropdown={() => hideMenu()} />
    </div>
  );
}
