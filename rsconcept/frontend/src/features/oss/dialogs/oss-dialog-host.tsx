'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { OssDialogType, useOssDialogsStore } from './oss-dialog-store';

const DlgChangeInputSchema = React.lazy(() =>
  import('./dlg-change-input-schema').then(module => ({ default: module.DlgChangeInputSchema }))
);
const DlgCreateSynthesis = React.lazy(() =>
  import('./dlg-create-synthesis').then(module => ({ default: module.DlgCreateSynthesis }))
);
const DlgCreateBlock = React.lazy(() =>
  import('./dlg-create-block').then(module => ({ default: module.DlgCreateBlock }))
);
const DlgEditBlock = React.lazy(() => import('./dlg-edit-block').then(module => ({ default: module.DlgEditBlock })));
const DlgEditOperation = React.lazy(() =>
  import('./dlg-edit-operation').then(module => ({ default: module.DlgEditOperation }))
);
const DlgDeleteOperation = React.lazy(() =>
  import('./dlg-delete-operation').then(module => ({ default: module.DlgDeleteOperation }))
);
const DlgDeleteReference = React.lazy(() =>
  import('./dlg-delete-replica').then(module => ({ default: module.DlgDeleteReplica }))
);
const DlgRelocateConstituents = React.lazy(() =>
  import('./dlg-relocate-constituents').then(module => ({ default: module.DlgRelocateConstituents }))
);
const DlgOssSettings = React.lazy(() =>
  import('./dlg-oss-settings').then(module => ({ default: module.DlgOssSettings }))
);
const DlgCreateSchema = React.lazy(() =>
  import('./dlg-create-schema').then(module => ({ default: module.DlgCreateSchema }))
);
const DlgImportSchema = React.lazy(() =>
  import('./dlg-import-schema').then(module => ({ default: module.DlgImportSchema }))
);

export function OssDialogHost() {
  const active = useOssDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case OssDialogType.CREATE_SYNTHESIS:
            return <DlgCreateSynthesis />;
          case OssDialogType.CREATE_BLOCK:
            return <DlgCreateBlock />;
          case OssDialogType.EDIT_BLOCK:
            return <DlgEditBlock />;
          case OssDialogType.EDIT_OPERATION:
            return <DlgEditOperation />;
          case OssDialogType.DELETE_OPERATION:
            return <DlgDeleteOperation />;
          case OssDialogType.DELETE_REFERENCE:
            return <DlgDeleteReference />;
          case OssDialogType.CHANGE_INPUT_SCHEMA:
            return <DlgChangeInputSchema />;
          case OssDialogType.RELOCATE_CONSTITUENTS:
            return <DlgRelocateConstituents />;
          case OssDialogType.OSS_SETTINGS:
            return <DlgOssSettings />;
          case OssDialogType.CREATE_SCHEMA:
            return <DlgCreateSchema />;
          case OssDialogType.IMPORT_SCHEMA:
            return <DlgImportSchema />;
        }
      })()}
    </Suspense>
  );
}
