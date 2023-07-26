import { useUserProfile } from '../../hooks/useUserProfile';

export function UserProfile() {
  const { user } = useUserProfile();
  console.log(user)
  return (
    <div className='flex flex-col items-center justify-center px-2 py-2 border'>
        <p>Логин: {user?.username ?? 'Логин'}</p>
        <p>Имя: {user?.first_name ?? 'Имя'}</p>
        <p>Фамилия: {user?.last_name ?? 'Фамилия'}</p>
        <p>Электронная почта: {user?.email ?? ''}</p>
        <button className='px-2 py-1 bg-green-500 border' onClick={() => { console.log('123') } } >Сохранить</button>
    </div>
  );
}
