import { TextURL } from '@/components/control';

export function NotFoundPage() {
  return (
    <div className='flex flex-col items-center px-6 py-3'>
      <h1>Ошибка 404 – Страница не найдена</h1>
      <p className='py-3'>Данная страница не существует или запрашиваемый объект отсутствует в базе данных</p>
      <p className='-mt-4'>
        <TextURL href='/' text='Вернуться на Портал' />
      </p>
    </div>
  );
}
