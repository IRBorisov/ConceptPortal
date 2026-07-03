'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { LibraryDialogType, useLibraryDialogsStore } from './library-dialog-store';

const DlgChangeLocation = React.lazy(() =>
  import('./dlg-change-location').then(module => ({ default: module.DlgChangeLocation }))
);
const DlgCloneLibraryItem = React.lazy(() =>
  import('./dlg-clone-library-item').then(module => ({ default: module.DlgCloneLibraryItem }))
);
const DlgCreateVersion = React.lazy(() =>
  import('./dlg-create-version').then(module => ({ default: module.DlgCreateVersion }))
);
const DlgEditEditors = React.lazy(() =>
  import('./dlg-edit-editors').then(module => ({ default: module.DlgEditEditors }))
);
const DlgEditVersions = React.lazy(() =>
  import('./dlg-edit-versions').then(module => ({ default: module.DlgEditVersions }))
);

export function LibraryDialogHost() {
  const active = useLibraryDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case LibraryDialogType.CHANGE_LOCATION:
            return <DlgChangeLocation />;
          case LibraryDialogType.CLONE_LIBRARY_ITEM:
            return <DlgCloneLibraryItem />;
          case LibraryDialogType.CREATE_VERSION:
            return <DlgCreateVersion />;
          case LibraryDialogType.EDIT_EDITORS:
            return <DlgEditEditors />;
          case LibraryDialogType.EDIT_VERSIONS:
            return <DlgEditVersions />;
        }
      })()}
    </Suspense>
  );
}
