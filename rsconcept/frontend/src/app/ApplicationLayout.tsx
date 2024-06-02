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
      <div className='min-w-[20rem] clr-app antialiased'>
        <ConceptToaster
          className='mt-[4rem] text-sm' // prettier: split lines
          autoClose={3000}
          draggable={false}
          pauseOnFocusLoss={false}
        />

        <Navigation />

        <div
          id={globals.main_scroll}
          className='cc-scroll-y flex flex-col items-start overflow-x-auto max-w-[100vw]'
          style={{
            maxHeight: viewportHeight,
            overflowY: showScroll ? 'scroll' : 'auto'
          }}
        >
          <main className='flex flex-col items-center w-full' style={{ minHeight: mainHeight }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </NavigationState>
  );
}

export default ApplicationLayout;
