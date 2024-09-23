import { Outlet } from 'react-router-dom';

import ConceptToaster from '@/app/ConceptToaster';
import Footer from '@/app/Footer';
import Navigation from '@/app/Navigation';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { NavigationState } from '@/context/NavigationContext';
import { globals } from '@/utils/constants';

function ApplicationLayout() {
  const { viewportHeight, mainHeight, showScroll } = useConceptOptions();
  return (
    <NavigationState>
      <div className='min-w-[20rem] clr-app antialiased h-full max-w-[120rem] mx-auto'>
        <ConceptToaster
          className='mt-[4rem] text-[14px]' // prettier: split lines
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
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </NavigationState>
  );
}

export default ApplicationLayout;
