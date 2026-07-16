'use client';

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { Footer } from '@/app/footer';
import { ToasterThemed } from '@/app/global-toaster';
import { TourHost } from '@/features/onboarding/components/tour-host';

import { ModalLoader } from '@/components/modal';
import { useDialogInert } from '@/hooks/use-dialog-inert';
import { useAppLayoutStore, useMainHeight, useViewportHeight } from '@/stores/app-layout';

import { AppShellDialogHosts } from '../app-shell-dialog-hosts';
import { GlobalLoader } from '../global-loader';
import { GlobalTooltips } from '../global-tooltips';
import { NavigationSandbox } from '../navigation/navigation-sandbox';
import { PdfExportOverlay } from '../pdf-export-overlay';

export function LayoutSandbox() {
  const tx = useTx();
  const mainHeight = useMainHeight();
  const viewportHeight = useViewportHeight();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
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

      <NavigationSandbox />

      <div className='overflow-x-auto max-w-dvw' style={{ maxHeight: viewportHeight }} inert={dialogInert}>
        <main className='cc-scroll-y overflow-y-auto' style={{ height: mainHeight }}>
          <GlobalLoader />
          <Outlet />
        </main>
        {!noNavigation && !noFooter ? <Footer /> : null}
      </div>
    </div>
  );
}
