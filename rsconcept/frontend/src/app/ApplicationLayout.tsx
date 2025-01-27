import { Suspense } from 'react';
import { Outlet } from 'react-router';

import ConceptToaster from '@/app/ConceptToaster';
import Footer from '@/app/Footer';
import Navigation from '@/app/Navigation';
import Loader from '@/components/ui/Loader';
import { NavigationState } from '@/app/Navigation/NavigationContext';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/appLayout';
import { globals } from '@/utils/constants';

import { GlobalDialogs } from './GlobalDialogs';
import { GlobalTooltips } from './GlobalTooltips';

function ApplicationLayout() {
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const showScroll = useAppLayoutStore(state => !state.noScroll);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);

  // TODO: prefetch data

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

        <GlobalDialogs />
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
