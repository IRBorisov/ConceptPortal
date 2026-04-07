'use client';

import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { Loader } from '@/components/loader';

import { GlobalTooltips } from './global-tooltips';

/** Minimal shell for the marketing landing and sandbox. */
export function LayoutLanding() {
  return (
    <div className='relative h-dvh min-w-80 overflow-y-auto bg-background antialiased cc-scroll-hidden'>
      <GlobalTooltips />
      <div className='mx-auto flex min-h-full max-w-480 flex-col'>
        <Suspense
          fallback={
            <div
              className='flex flex-1 flex-col items-center justify-center gap-2 pt-20'
              aria-busy='true'
              aria-label='Загрузка'
            >
              <Loader scale={3} />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
