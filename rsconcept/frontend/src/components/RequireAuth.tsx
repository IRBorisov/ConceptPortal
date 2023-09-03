import { useAuth } from '../context/AuthContext';
import TextURL from './Common/TextURL';

interface RequireAuthProps {
  children: React.ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();

  return (
    <>
      {user && children}
      {!user &&
        <div className='flex flex-col items-center gap-1 mt-2'>
          <p><b>Данная страница доступна только зарегистрированным пользователям</b></p>
          <p className='mb-2'>Пожалуйста войдите в систему</p>
          <TextURL text='Войти в Портал' href='/login'/>
          <TextURL text='Зарегистрироваться' href='/signup'/>
          <TextURL text='Начальная страница' href='/'/>
        </div>
      }
    </>
  );
}

export default RequireAuth;
