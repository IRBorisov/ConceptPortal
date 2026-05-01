'use client';

import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';

export function NotFoundPage() {
  const tx = useTx();
  return (
    <div className='flex flex-col items-center px-6 py-3'>
      <h1>{tx('ui.page.notFound.title', 'Error 404 – Page not found')}</h1>
      <p className='py-3'>
        {tx('ui.page.notFound.body', 'This page does not exist or the requested object is missing from the database.')}
      </p>
      <p className='-mt-4'>
        <TextURL href='/' text={tx('ui.page.notFound.back', 'Return to the portal')} />
      </p>
    </div>
  );
}
