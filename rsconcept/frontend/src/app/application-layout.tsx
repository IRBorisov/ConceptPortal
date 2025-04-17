import { Suspense } from 'react';
import { Outlet } from 'react-router';
import clsx from 'clsx';

import { ModalLoader } from '@/components/modal';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

import { NavigationState } from './navigation/navigation-context';
import { Footer } from './footer';
import { GlobalDialogs } from './global-dialogs';
import { GlobalLoader } from './global-Loader';
import { ToasterThemed } from './global-toaster';
import { GlobalTooltips } from './global-tooltips';
import { MutationErrors } from './mutation-errors';
import { Navigation } from './navigation';

export function ApplicationLayout() {
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  const activeDialog = useDialogsStore(state => state.active);

  return (
    <NavigationState>
      <div className='min-w-80 antialiased h-full max-w-480 mx-auto'>
        <ToasterThemed
          className={clsx('sm:text-[14px]/[20px] text-[12px]/[16px]', noNavigationAnimation ? 'mt-6' : 'mt-14')}
          aria-label='Оповещения'
          autoClose={3000}
          draggable={false}
          pauseOnFocusLoss={false}
        />

        <Suspense fallback={<ModalLoader />}>
          <GlobalDialogs />
        </Suspense>
        <GlobalTooltips />

        <Navigation />

        <div
          className='overflow-x-auto max-w-[100vw]'
          style={{ maxHeight: viewportHeight }}
          inert={activeDialog !== null}
        >
          <main className='cc-scroll-y overflow-y-auto' style={{ minHeight: mainHeight }}>
            <GlobalLoader />
            <MutationErrors />
            <Outlet />
          </main>
          {!noNavigation && !noFooter ? <Footer /> : null}
        </div>
      </div>
    </NavigationState>
  );
}
