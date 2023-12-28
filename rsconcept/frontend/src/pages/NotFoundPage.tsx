import TextURL from '@/components/Common/TextURL';

export function NotFoundPage() {
  return (
    <div className='flex flex-col items-center px-6 py-6'>
      <h1 className='mb-3'>Ошибка 404 - Страница не найдена</h1>
      <p className='py-3'>Данная страница не существует или запрашиваемый объект отсутствует в базе данных</p>
      <TextURL href='/' text='Вернуться на Портал' />
    </div>
  );
}

export default NotFoundPage;
