'use client';

import { TextURL } from '@/components/Control';

import { useAuthSuspense } from '../backend/useAuth';

export function RequireAuth({ children }: React.PropsWithChildren) {
  const { isAnonymous } = useAuthSuspense();

  if (isAnonymous) {
    return (
      <div key='auth-no-user' className='flex flex-col items-center gap-1 mt-2'>
        <p className='mb-2'>Пожалуйста войдите в систему</p>
        <TextURL text='Войти в Портал' href='/login' />
        <TextURL text='Зарегистрироваться' href='/signup' />
        <TextURL text='Начальная страница' href='/' />
      </div>
    );
  }
  return <>{children}</>;
}
