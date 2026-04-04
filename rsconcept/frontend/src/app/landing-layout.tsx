'use client';

import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { ThemeToggle } from '@/features/home/components/theme-toggle';

import { Loader } from '@/components/loader';
import { useBrowserNavigation } from '@/hooks/use-browser-navigation';

/**
 * Minimal shell for the marketing landing and sandbox.
 * Wraps lazy child routes (e.g. sandbox) in {@link Suspense}.
 */
export function LandingLayout() {
  useBrowserNavigation();

  return (
    <div className='relative min-h-dvh min-w-80 bg-background antialiased'>
      <ThemeToggle />
      <div className='mx-auto flex min-h-dvh max-w-480 flex-col'>
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
