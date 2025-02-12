import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { Loader } from '@/components/Loader';
import { ModalLoader } from '@/components/Modal';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/appLayout';
import { globals } from '@/utils/constants';

import { NavigationState } from './Navigation/NavigationContext';
import { Footer } from './Footer';
import { GlobalDialogs } from './GlobalDialogs';
import ConceptToaster from './GlobalToaster';
import { GlobalTooltips } from './GlobalTooltips';
import { Navigation } from './Navigation';

function ApplicationLayout() {
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const showScroll = useAppLayoutStore(state => !state.noScroll);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);

  return (
    <NavigationState>
      <div className='min-w-[20rem] antialiased h-full max-w-[120rem] mx-auto'>
        <ConceptToaster
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
          id={globals.main_scroll}
          className='overflow-x-auto max-w-[100vw]'
          style={{
            maxHeight: viewportHeight
          }}
        >
          <main className='cc-scroll-y' style={{ overflowY: showScroll ? 'scroll' : 'auto', minHeight: mainHeight }}>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </main>
          {!noNavigation && !noFooter ? <Footer /> : null}
        </div>
      </div>
    </NavigationState>
  );
}

export default ApplicationLayout;
