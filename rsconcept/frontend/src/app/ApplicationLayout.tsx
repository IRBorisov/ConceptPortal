import { Outlet } from 'react-router-dom';

import ConceptToaster from '@/app/ConceptToaster';
import Footer from '@/app/Footer';
import Navigation from '@/app/Navigation';
import { NavigationState } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { globals } from '@/utils/constants';

function ApplicationLayout() {
  const { viewportHeight, mainHeight, showScroll } = useConceptOptions();
  return (
    <NavigationState>
      <div className='min-w-[20rem] overflow-x-auto max-w-[100vw] clr-app antialiased'>
        <ConceptToaster
          className='mt-[4rem] text-sm' // prettier: split lines
          autoClose={3000}
          draggable={false}
          pauseOnFocusLoss={false}
        />

        <Navigation />

        <div
          id={globals.main_scroll}
          className='cc-scroll-y min-w-fit'
          style={{
            maxHeight: viewportHeight,
            overflowY: showScroll ? 'scroll' : 'auto'
          }}
        >
          <main className='flex flex-col items-center' style={{ minHeight: mainHeight }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </NavigationState>
  );
}

export default ApplicationLayout;
