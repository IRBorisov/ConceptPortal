'use client';

import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router';

import { Button } from '@/components/control';
import { InfoError } from '@/components/info-error';
import { handleStaleBundleError, isStaleBundleError } from '@/utils/stale-bundle-error';

export function ErrorFallback() {
  const error = useRouteError();
  const router = useNavigate();

  useEffect(
    function reloadOnStaleError() {
      handleStaleBundleError(error);
    },
    [error]
  );

  function resetErrorBoundary() {
    Promise.resolve(router('/')).catch(console.error);
  }

  if (isStaleBundleError(error)) {
    return (
      <div className='flex flex-col gap-3 my-3 items-center antialiased' role='alert'>
        <h1 className='my-2'>Обновление страницы...</h1>
        <p>Обнаружена устаревшая версия приложения. Перезагрузка страницы...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 my-3 mx-6 antialiased' role='alert'>
      <h1 className='my-2'>Что-то пошло не так!</h1>
      <Button onClick={resetErrorBoundary} className='w-fit mx-auto' text='Вернуться на главную' />
      <div className='max-w-[100vws] overflow-auto'>
        <InfoError error={error as Error} />
      </div>
    </div>
  );
}
