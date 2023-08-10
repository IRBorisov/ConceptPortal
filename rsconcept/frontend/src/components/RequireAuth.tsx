import { useAuth } from '../context/AuthContext';
import TextURL from './Common/TextURL';
import InfoMessage from './InfoMessage';

interface RequireAuthProps {
  children: React.ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();

  return (
    <>
      {user && children}
      {!user &&
        <div className='flex flex-col items-center'>
          <InfoMessage message={'Данная функция доступна только зарегистрированным пользователям. Пожалуйста войдите в систему'} />
          <div className='flex flex-col items-start'>
            <TextURL text='Войти в систему...' href='/login' />
            <TextURL text='Зарегистрироваться...' href='/signup' />
          </div>
        </div>
      }
    </>
  );
}

export default RequireAuth;
