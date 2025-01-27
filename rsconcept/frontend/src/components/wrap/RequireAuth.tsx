'use client';

import { useAuth } from '@/backend/auth/useAuth';

import Loader from '../ui/Loader';
import TextURL from '../ui/TextURL';

function RequireAuth({ children }: React.PropsWithChildren) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader key='auth-loader' />;
  }
  if (user) {
    return <>{children}</>;
  } else {
    return (
      <div key='auth-no-user' className='flex flex-col items-center gap-1 mt-2'>
        <p className='mb-2'>Пожалуйста войдите в систему</p>
        <TextURL text='Войти в Портал' href='/login' />
        <TextURL text='Зарегистрироваться' href='/signup' />
        <TextURL text='Начальная страница' href='/' />
      </div>
    );
  }
}

export default RequireAuth;
