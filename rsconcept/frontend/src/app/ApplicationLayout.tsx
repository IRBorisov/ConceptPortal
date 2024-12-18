import { Suspense } from 'react';
import { Outlet } from 'react-router';

import ConceptToaster from '@/app/ConceptToaster';
import Footer from '@/app/Footer';
import Navigation from '@/app/Navigation';
import Loader from '@/components/ui/Loader';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { NavigationState } from '@/context/NavigationContext';
import { globals } from '@/utils/constants';

function ApplicationLayout() {
  const { viewportHeight, mainHeight, showScroll, noNavigationAnimation } = useConceptOptions();
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
          <Footer />
        </div>
      </div>
    </NavigationState>
  );
}

export default ApplicationLayout;
