'use client';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';

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
      <p className='font-semibold'>{tx('tx.shell.auth.signedInAs', { username: user.username })}</p>
      <div className='flex gap-3'>
        <TextURL text={tx('tx.general.create')} href='/library/create' />
        <span> | </span>
        <TextURL text={tx('tx.lib.library')} href='/library' />
        <span> | </span>
        <TextURL text={tx('tx.general.help')} href='/manuals' />
        <span> | </span>
        <span
          className='cursor-pointer hover:underline text-primary'
          aria-label={tx('tx.general.logout')}
          onClick={logoutAndRedirect}
        >
          {tx('tx.general.logout')}
        </span>
      </div>
    </div>
  );
}
