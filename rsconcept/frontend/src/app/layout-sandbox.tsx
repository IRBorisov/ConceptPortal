'use client';

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import clsx from 'clsx';

import { Footer } from '@/app/footer';
import { ToasterThemed } from '@/app/global-toaster';

import { ModalLoader } from '@/components/modal';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

import { NavigationSandbox } from './navigation/navigation-sandbox';
import { GlobalDialogs } from './global-dialogs';
import { GlobalLoader } from './global-loader';
import { GlobalTooltips } from './global-tooltips';

export function LayoutSandbox() {
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const toastBottom = useAppLayoutStore(state => state.toastBottom);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  const activeDialog = useDialogsStore(state => state.active);

  return (
    <div className='min-w-80 antialiased h-full max-w-480 mx-auto'>
      <ToasterThemed
        className={clsx('sm:text-[14px]/[20px] text-[12px]/[16px]', noNavigationAnimation ? 'mt-9' : 'mt-17')}
        aria-label='Оповещения'
        autoClose={3000}
        draggable={false}
        pauseOnFocusLoss={false}
        position={toastBottom ? 'bottom-right' : 'top-right'}
        newestOnTop={toastBottom}
      />

      <Suspense fallback={<ModalLoader />}>
        <GlobalDialogs />
      </Suspense>
      <GlobalTooltips />

      <NavigationSandbox />

      <div className='overflow-x-auto max-w-dvw' style={{ maxHeight: viewportHeight }} inert={activeDialog !== null}>
        <main className='cc-scroll-y overflow-y-auto' style={{ height: mainHeight }}>
          <GlobalLoader />
          <Outlet />
        </main>
        {!noNavigation && !noFooter ? <Footer /> : null}
      </div>
    </div>
  );
}
