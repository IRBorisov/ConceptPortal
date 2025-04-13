import { Suspense } from 'react';

import { useDropdown } from '@/components/dropdown';
import { Loader } from '@/components/loader';

import { urls } from '../urls';

import { useConceptNavigation } from './navigation-context';
import { UserButton } from './user-button';
import { UserDropdown } from './user-dropdown';

export function UserMenu() {
  const router = useConceptNavigation();
  const menu = useDropdown();
  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='flex items-center justify-start relative h-full pr-2'>
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
