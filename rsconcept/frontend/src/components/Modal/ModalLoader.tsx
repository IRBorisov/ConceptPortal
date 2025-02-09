'use client';

import clsx from 'clsx';

import { Loader } from '@/components/Loader';

export function ModalLoader() {
  return (
    <div className='fixed top-0 left-0 w-full h-full z-modal cursor-default'>
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'backdrop-blur-[3px] opacity-50')} />
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'bg-prim-0 opacity-25')} />
      <div
        className={clsx(
          'cc-animate-modal p-20',
          'z-modal absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border rounded-xl bg-prim-100'
        )}
      >
        <Loader circular scale={6} />
      </div>
    </div>
  );
}
