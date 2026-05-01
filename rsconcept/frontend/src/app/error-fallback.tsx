'use client';

import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router';

import { useTx } from '@/i18n/use-tx';

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
      <div className='flex flex-col gap-3 my-3 items-center antialiased' role='alert'>
        <h1 className='my-2'>{tx('error.stale.title', 'Refreshing page…')}</h1>
        <p>{tx('error.stale.body', 'An outdated app build was detected. Reloading the page…')}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 my-3 mx-6 antialiased' role='alert'>
      <h1 className='my-2'>{tx('error.generic.title', 'Something went wrong')}</h1>
      <Button onClick={resetErrorBoundary} className='w-fit mx-auto' text={tx('error.generic.home', 'Back to home')} />
      <div className='max-w-[100vws] overflow-auto'>
        <InfoError error={error as Error} />
      </div>
    </div>
  );
}
