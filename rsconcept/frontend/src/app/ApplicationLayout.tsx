import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { ModalLoader } from '@/components/Modal';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';

import { NavigationState } from './Navigation/NavigationContext';
import { Footer } from './Footer';
import { GlobalDialogs } from './GlobalDialogs';
import { GlobalLoader } from './GlobalLoader';
import { ToasterThemed } from './GlobalToaster';
import { GlobalTooltips } from './GlobalTooltips';
import { MutationErrors } from './MutationErrors';
import { Navigation } from './Navigation';

export function ApplicationLayout() {
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const showScroll = useAppLayoutStore(state => !state.noScroll);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  const activeDialog = useDialogsStore(state => state.active);

  return (
    <NavigationState>
      <div className='min-w-[20rem] antialiased h-full max-w-[120rem] mx-auto'>
        <ToasterThemed
          className='text-[14px] cc-animate-position'
          style={{ marginTop: noNavigationAnimation ? '1.5rem' : '3.5rem' }}
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
          <main className='cc-scroll-y' style={{ overflowY: showScroll ? 'scroll' : 'auto', minHeight: mainHeight }}>
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
