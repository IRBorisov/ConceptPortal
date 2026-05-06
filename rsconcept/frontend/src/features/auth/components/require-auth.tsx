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
        <p className='mb-2'>{tx('tx.shell.auth.required')}</p>
        <TextURL text={tx('tx.general.login.hint')} href='/login' />
        <TextURL text={tx('tx.shell.signup')} href='/signup' />
        <TextURL text={tx('tx.general.home')} href='/' />
      </div>
    );
  }
  return <>{children}</>;
}
