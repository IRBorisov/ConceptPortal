import { urls, useConceptNavigation } from '@/app';

import { TextURL } from '@/components/control';

import { useAuthSuspense } from '../backend/use-auth';
import { useLogout } from '../backend/use-logout';

export function ExpectedAnonymous() {
  const { user } = useAuthSuspense();
  const { logout } = useLogout();
  const router = useConceptNavigation();

  function logoutAndRedirect() {
    void logout().then(() => router.push({ path: urls.login, force: true }));
  }

  return (
    <div className='flex flex-col items-center gap-3 py-6'>
      <p className='font-semibold'>{`Вы вошли в систему как ${user.username}`}</p>
      <div className='flex gap-3'>
        <TextURL text='Новая схема' href='/library/create' />
        <span> | </span>
        <TextURL text='Библиотека' href='/library' />
        <span> | </span>
        <TextURL text='Справка' href='/manuals' />
        <span> | </span>
        <span className='cursor-pointer hover:underline text-primary' aria-label='Выйти' onClick={logoutAndRedirect}>
          Выйти
        </span>
      </div>
    </div>
  );
}
