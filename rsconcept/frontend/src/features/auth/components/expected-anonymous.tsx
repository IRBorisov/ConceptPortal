'use client';

import { urls, useConceptNavigation } from '@/app';
import { useTx } from '@/app/i18n/use-tx';

import { TextURL } from '@/components/control';

import { useAuth } from '../backend/use-auth';
import { useLogout } from '../backend/use-logout';

export function ExpectedAnonymous() {
  const tx = useTx();
  const { user } = useAuth();
  const { logout } = useLogout();
  const router = useConceptNavigation();

  function logoutAndRedirect() {
    void logout().then(() => router.push({ path: urls.login, force: true }));
  }

  return (
    <div className='flex flex-col items-center gap-3 py-6'>
      <p className='font-semibold'>{tx('auth.anonymous.signedInAs', 'You are signed in as {username}', { username: user.username })}</p>
      <div className='flex gap-3'>
        <TextURL text={tx('auth.anonymous.create', 'Create')} href='/library/create' />
        <span> | </span>
        <TextURL text={tx('ui.nav.library', 'Library')} href='/library' />
        <span> | </span>
        <TextURL text={tx('auth.anonymous.manuals', 'Manuals')} href='/manuals' />
        <span> | </span>
        <span
          className='cursor-pointer hover:underline text-primary'
          aria-label={tx('auth.anonymous.logoutAria', 'Log out')}
          onClick={logoutAndRedirect}
        >
          {tx('auth.anonymous.logout', 'Log out')}
        </span>
      </div>
    </div>
  );
}
