'use client';

import { AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';

import Loader from '../ui/Loader';
import TextURL from '../ui/TextURL';
import AnimateFade from './AnimateFade';

interface RequireAuthProps {
  children: React.ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();

  return (
    <AnimatePresence mode='wait'>
      {loading ? <Loader key='auth-loader' /> : null}
      {!loading && user ? <AnimateFade key='auth-data'>{children}</AnimateFade> : null}
      {!loading && !user ? (
        <AnimateFade key='auth-no-user' className='flex flex-col items-center gap-1 mt-2'>
          <p className='mb-2'>Пожалуйста войдите в систему</p>
          <TextURL text='Войти в Портал' href='/login' />
          <TextURL text='Зарегистрироваться' href='/signup' />
          <TextURL text='Начальная страница' href='/' />
        </AnimateFade>
      ) : null}
    </AnimatePresence>
  );
}

export default RequireAuth;
