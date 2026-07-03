'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { RsmodelDialogType, useRsmodelDialogsStore } from './rsmodel-dialog-store';

const DlgModelEditValue = React.lazy(() =>
  import('./dlg-edit-value').then(module => ({ default: module.DlgEditValue }))
);
const DlgModelViewValue = React.lazy(() =>
  import('./dlg-view-value').then(module => ({ default: module.DlgViewValue }))
);
const DlgModelEditBinding = React.lazy(() =>
  import('./dlg-edit-binding').then(module => ({ default: module.DlgEditBinding }))
);

export function RsmodelDialogHost() {
  const active = useRsmodelDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case RsmodelDialogType.EDIT_VALUE:
            return <DlgModelEditValue />;
          case RsmodelDialogType.VIEW_VALUE:
            return <DlgModelViewValue />;
          case RsmodelDialogType.EDIT_BINDING:
            return <DlgModelEditBinding />;
        }
      })()}
    </Suspense>
  );
}
