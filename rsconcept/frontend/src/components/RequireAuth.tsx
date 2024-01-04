'use client';

import { useAuth } from '@/context/AuthContext';

import TextURL from './ui/TextURL';

interface RequireAuthProps {
  children: React.ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  if (user) {
    return children;
  } else {
    return (
      <div className='flex flex-col items-center gap-1 mt-2'>
        <p className='mb-2'>Пожалуйста войдите в систему</p>
        <TextURL text='Войти в Портал' href='/login' />
        <TextURL text='Зарегистрироваться' href='/signup' />
        <TextURL text='Начальная страница' href='/' />
      </div>
    );
  }
}

export default RequireAuth;
