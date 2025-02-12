'use client';

import React from 'react';

import { DialogType, useDialogsStore } from '@/stores/dialogs';

const DlgChangeInputSchema = React.lazy(() => import('@/features/oss/dialogs/DlgChangeInputSchema'));
const DlgChangeLocation = React.lazy(() => import('@/features/library/dialogs/DlgChangeLocation'));
const DlgCloneLibraryItem = React.lazy(() => import('@/features/library/dialogs/DlgCloneLibraryItem'));
const DlgCreateCst = React.lazy(() => import('@/features/rsform/dialogs/DlgCreateCst'));
const DlgCreateOperation = React.lazy(() => import('@/features/oss/dialogs/DlgCreateOperation'));
const DlgCreateVersion = React.lazy(() => import('@/features/library/dialogs/DlgCreateVersion'));
const DlgCstTemplate = React.lazy(() => import('@/features/rsform/dialogs/DlgCstTemplate'));
const DlgDeleteCst = React.lazy(() => import('@/features/rsform/dialogs/DlgDeleteCst'));
const DlgDeleteOperation = React.lazy(() => import('@/features/oss/dialogs/DlgDeleteOperation'));
const DlgEditEditors = React.lazy(() => import('@/features/library/dialogs/DlgEditEditors'));
const DlgEditOperation = React.lazy(() => import('@/features/oss/dialogs/DlgEditOperation'));
const DlgEditReference = React.lazy(() => import('@/features/rsform/dialogs/DlgEditReference'));
const DlgEditVersions = React.lazy(() => import('@/features/library/dialogs/DlgEditVersions'));
const DlgEditWordForms = React.lazy(() => import('@/features/rsform/dialogs/DlgEditWordForms'));
const DlgGraphParams = React.lazy(() => import('@/features/rsform/dialogs/DlgGraphParams'));
const DlgInlineSynthesis = React.lazy(() => import('@/features/rsform/dialogs/DlgInlineSynthesis'));
const DlgRelocateConstituents = React.lazy(() => import('@/features/oss/dialogs/DlgRelocateConstituents'));
const DlgRenameCst = React.lazy(() => import('@/features/rsform/dialogs/DlgRenameCst'));
const DlgShowAST = React.lazy(() => import('@/features/rsform/dialogs/DlgShowAST'));
const DlgShowQR = React.lazy(() => import('@/features/rsform/dialogs/DlgShowQR'));
const DlgShowTypeGraph = React.lazy(() => import('@/features/rsform/dialogs/DlgShowTypeGraph'));
const DlgSubstituteCst = React.lazy(() => import('@/features/rsform/dialogs/DlgSubstituteCst'));
const DlgUploadRSForm = React.lazy(() => import('@/features/rsform/dialogs/DlgUploadRSForm'));

export const GlobalDialogs = () => {
  const active = useDialogsStore(state => state.active);

  if (active === undefined) {
    return null;
  }
  switch (active) {
    case DialogType.CONSTITUENTA_TEMPLATE:
      return <DlgCstTemplate />;
    case DialogType.CREATE_CONSTITUENTA:
      return <DlgCreateCst />;
    case DialogType.CREATE_OPERATION:
      return <DlgCreateOperation />;
    case DialogType.DELETE_CONSTITUENTA:
      return <DlgDeleteCst />;
    case DialogType.EDIT_EDITORS:
      return <DlgEditEditors />;
    case DialogType.EDIT_OPERATION:
      return <DlgEditOperation />;
    case DialogType.EDIT_REFERENCE:
      return <DlgEditReference />;
    case DialogType.EDIT_VERSIONS:
      return <DlgEditVersions />;
    case DialogType.EDIT_WORD_FORMS:
      return <DlgEditWordForms />;
    case DialogType.INLINE_SYNTHESIS:
      return <DlgInlineSynthesis />;
    case DialogType.SHOW_AST:
      return <DlgShowAST />;
    case DialogType.SHOW_TYPE_GRAPH:
      return <DlgShowTypeGraph />;
    case DialogType.CHANGE_INPUT_SCHEMA:
      return <DlgChangeInputSchema />;
    case DialogType.CHANGE_LOCATION:
      return <DlgChangeLocation />;
    case DialogType.CLONE_LIBRARY_ITEM:
      return <DlgCloneLibraryItem />;
    case DialogType.CREATE_VERSION:
      return <DlgCreateVersion />;
    case DialogType.DELETE_OPERATION:
      return <DlgDeleteOperation />;
    case DialogType.GRAPH_PARAMETERS:
      return <DlgGraphParams />;
    case DialogType.RELOCATE_CONSTITUENTS:
      return <DlgRelocateConstituents />;
    case DialogType.RENAME_CONSTITUENTA:
      return <DlgRenameCst />;
    case DialogType.SHOW_QR_CODE:
      return <DlgShowQR />;
    case DialogType.SUBSTITUTE_CONSTITUENTS:
      return <DlgSubstituteCst />;
    case DialogType.UPLOAD_RSFORM:
      return <DlgUploadRSForm />;
  }
};
