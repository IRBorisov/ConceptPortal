import { Suspense } from 'react';

import Loader from '@/components/ui/Loader';
import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import useDropdown from '@/hooks/useDropdown';

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
