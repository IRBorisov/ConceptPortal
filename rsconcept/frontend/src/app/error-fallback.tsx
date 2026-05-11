'use client';

import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { InfoError } from '@/components/info-error';
import { handleStaleBundleError, isStaleBundleError } from '@/utils/stale-bundle-error';

export function ErrorFallback() {
  const tx = useTx();
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
      <div className='h-full flex flex-col justify-center gap-3 items-center antialiased' role='alert'>
        <h1 className='my-2'>{tx('tx.shell.updater.header')}</h1>
        <p>{tx('tx.shell.updater.body')}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 my-3 mx-6 antialiased' role='alert'>
      <h1 className='my-2'>{tx('tx.shell.error.header')}</h1>
      <Button onClick={resetErrorBoundary} className='w-fit mx-auto' text={tx('tx.shell.error.home')} />
      <div className='max-w-[100vws] overflow-auto'>
        <InfoError error={error as Error} />
      </div>
    </div>
  );
}
