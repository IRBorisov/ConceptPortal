'use client';

import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';

export function NotFoundPage() {
  const tx = useTx();
  return (
    <div className='flex flex-col items-center px-6 py-3'>
      <h1>{tx('tx.shell.404.header')}</h1>
      <p className='py-3'>{tx('tx.shell.404.body')}</p>
      <p className='-mt-4'>
        <TextURL href='/' text={tx('tx.shell.404.back')} />
      </p>
    </div>
  );
}
