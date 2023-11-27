import TextURL from '../components/Common/TextURL';

export function NotFoundPage() {
  return (
  <div className='flex flex-col px-4 py-2'>
    <h1 className='text-xl font-semibold'>Ошибка 404 - Страница не найдена</h1>
    <p className='mt-2'>Данная страница не существует или запрашиваемый объект отсутствует в базе данных</p>
    <TextURL href='/' text='Вернуться на Портал' />
  </div>);
}

export default NotFoundPage;
