'use client';

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { TourHost } from '@/features/onboarding/components/tour-host';

import { ModalLoader } from '@/components/modal';
import { useDialogInert } from '@/hooks/use-dialog-inert';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/app-layout';

import { AppShellDialogHosts } from '../app-shell-dialog-hosts';
import { Footer } from '../footer';
import { GlobalLoader } from '../global-loader';
import { ToasterThemed } from '../global-toaster';
import { GlobalTooltips } from '../global-tooltips';
import { MutationErrors } from '../mutation-errors';
import { Navigation } from '../navigation';
import { PdfExportOverlay } from '../pdf-export-overlay';

export function LayoutMain() {
  const tx = useTx();
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const toastBottom = useAppLayoutStore(state => state.toastBottom);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  const dialogInert = useDialogInert();

  return (
    <div className='min-w-80 antialiased h-full max-w-480 mx-auto'>
      <ToasterThemed
        className={clsx('sm:text-[14px]/[20px] text-[12px]/[16px]', noNavigationAnimation ? 'mt-9' : 'mt-17')}
        aria-label={tx('tx.general.notification')}
        autoClose={3000}
        draggable={false}
        pauseOnFocusLoss={false}
        position={toastBottom ? 'bottom-right' : 'top-right'}
        newestOnTop={toastBottom}
      />

      <Suspense fallback={<ModalLoader />}>
        <AppShellDialogHosts />
      </Suspense>
      <GlobalTooltips />
      <TourHost />
      <PdfExportOverlay />

      <Navigation />

      <div className='overflow-x-auto max-w-dvw' style={{ maxHeight: viewportHeight }} inert={dialogInert}>
        <main className='cc-scroll-y overflow-y-auto' style={{ height: mainHeight }}>
          <GlobalLoader />
          <MutationErrors />
          <Outlet />
        </main>
        {!noNavigation && !noFooter ? <Footer /> : null}
      </div>
    </div>
  );
}
