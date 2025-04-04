import { useNavigate, useRouteError } from 'react-router';

import { Button } from '@/components/control';
import { InfoError } from '@/components/info-error';

export function ErrorFallback() {
  const error = useRouteError();
  const router = useNavigate();

  function resetErrorBoundary() {
    Promise.resolve(router('/')).catch(console.error);
  }
  return (
    <div className='flex flex-col gap-3 my-3 items-center antialiased' role='alert'>
      <h1 className='my-2'>Что-то пошло не так!</h1>
      <Button onClick={resetErrorBoundary} text='Вернуться на главную' />
      <InfoError error={error as Error} />
    </div>
  );
}
