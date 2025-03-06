import { Suspense } from 'react';

import { useDropdown } from '@/components/Dropdown';
import { Loader } from '@/components/Loader';

import { urls } from '../urls';

import { useConceptNavigation } from './NavigationContext';
import { UserButton } from './UserButton';
import { UserDropdown } from './UserDropdown';

export function UserMenu() {
  const router = useConceptNavigation();
  const menu = useDropdown();
  return (
    <div ref={menu.ref} className='h-full w-[4rem] flex items-center justify-center'>
      <Suspense fallback={<Loader circular scale={1.5} />}>
        <UserButton
          onLogin={() => router.push({ path: urls.login, force: true })}
          onClickUser={menu.toggle}
          isOpen={menu.isOpen}
        />
      </Suspense>
      <UserDropdown isOpen={menu.isOpen} hideDropdown={() => menu.hide()} />
    </div>
  );
}
