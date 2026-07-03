'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { HelpDialogType, useHelpDialogsStore } from './help-dialog-store';

const DlgShowVideo = React.lazy(() =>
  import('./dlg-show-video').then(module => ({ default: module.DlgShowVideo }))
);

export function HelpDialogHost() {
  const active = useHelpDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case HelpDialogType.SHOW_VIDEO:
            return <DlgShowVideo />;
        }
      })()}
    </Suspense>
  );
}
