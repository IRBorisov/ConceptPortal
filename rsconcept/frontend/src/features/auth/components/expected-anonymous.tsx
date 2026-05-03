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
      <p className='font-semibold'>{tx('auth.anonymous.signedInAs', { username: user.username })}</p>
      <div className='flex gap-3'>
        <TextURL text={tx('semantic.action.create')} href='/library/create' />
        <span> | </span>
        <TextURL text={tx('semantic.term.library')} href='/library' />
        <span> | </span>
        <TextURL text={tx('semantic.term.manual')} href='/manuals' />
        <span> | </span>
        <span
          className='cursor-pointer hover:underline text-primary'
          aria-label={tx('semantic.action.logout')}
          onClick={logoutAndRedirect}
        >
          {tx('semantic.action.logout')}
        </span>
      </div>
    </div>
  );
}
