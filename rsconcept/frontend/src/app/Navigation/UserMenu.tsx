import { Suspense } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { useDropdown } from '@/components/ui/Dropdown';
import Loader from '@/components/ui/Loader';

import { urls } from '../urls';
import UserButton from './UserButton';
import UserDropdown from './UserDropdown';

function UserMenu() {
  const router = useConceptNavigation();
  const menu = useDropdown();
  return (
    <div ref={menu.ref} className='h-full w-[4rem] flex items-center justify-center'>
      <Suspense fallback={<Loader circular scale={1.5} />}>
        <UserButton onLogin={() => router.push(urls.login)} onClickUser={menu.toggle} />
      </Suspense>
      <UserDropdown isOpen={menu.isOpen} hideDropdown={() => menu.hide()} />
    </div>
  );
}

export default UserMenu;
