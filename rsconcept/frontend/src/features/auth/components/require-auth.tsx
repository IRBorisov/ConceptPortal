'use client';

import { useTx } from '@/i18n/use-tx';

import { TextURL } from '@/components/control';

import { useAuth } from '../backend/use-auth';

export function RequireAuth({ children }: React.PropsWithChildren) {
  const tx = useTx();
  const { isAnonymous } = useAuth();

  if (isAnonymous) {
    return (
      <div key='auth-no-user' className='flex flex-col items-center gap-1 mt-2'>
        <p className='mb-2'>{tx('auth.require.prompt', 'Please sign in.')}</p>
        <TextURL text={tx('auth.restore.loginLink', 'Sign in to the portal')} href='/login' />
        <TextURL text={tx('auth.require.signup', 'Sign up')} href='/signup' />
        <TextURL text={tx('auth.require.home', 'Home')} href='/' />
      </div>
    );
  }
  return <>{children}</>;
}
