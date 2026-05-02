'use client';

import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';

import { useAuth } from '../backend/use-auth';

export function RequireAuth({ children }: React.PropsWithChildren) {
  const tx = useTx();
  const { isAnonymous } = useAuth();

  if (isAnonymous) {
    return (
      <div key='auth-no-user' className='flex flex-col items-center gap-1 mt-2'>
        <p className='mb-2'>{tx('auth.require.prompt')}</p>
        <TextURL text={tx('auth.restore.loginLink')} href='/login' />
        <TextURL text={tx('auth.require.signup')} href='/signup' />
        <TextURL text={tx('auth.require.home')} href='/' />
      </div>
    );
  }
  return <>{children}</>;
}
