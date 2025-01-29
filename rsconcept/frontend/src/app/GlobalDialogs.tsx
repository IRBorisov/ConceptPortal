'use client';

import React from 'react';

import { DialogType } from '@/models/miscellaneous';
import { useDialogsStore } from '@/stores/dialogs';

const DlgChangeInputSchema = React.lazy(() => import('@/dialogs/DlgChangeInputSchema'));
const DlgChangeLocation = React.lazy(() => import('@/dialogs/DlgChangeLocation'));
const DlgCloneLibraryItem = React.lazy(() => import('@/dialogs/DlgCloneLibraryItem'));
const DlgCreateCst = React.lazy(() => import('@/dialogs/DlgCreateCst'));
const DlgCreateOperation = React.lazy(() => import('@/dialogs/DlgCreateOperation'));
const DlgCreateVersion = React.lazy(() => import('@/dialogs/DlgCreateVersion'));
const DlgCstTemplate = React.lazy(() => import('@/dialogs/DlgCstTemplate'));
const DlgDeleteCst = React.lazy(() => import('@/dialogs/DlgDeleteCst'));
const DlgDeleteOperation = React.lazy(() => import('@/dialogs/DlgDeleteOperation'));
const DlgEditEditors = React.lazy(() => import('@/dialogs/DlgEditEditors'));
const DlgEditOperation = React.lazy(() => import('@/dialogs/DlgEditOperation'));
const DlgEditReference = React.lazy(() => import('@/dialogs/DlgEditReference'));
const DlgEditVersions = React.lazy(() => import('@/dialogs/DlgEditVersions'));
const DlgEditWordForms = React.lazy(() => import('@/dialogs/DlgEditWordForms'));
const DlgGraphParams = React.lazy(() => import('@/dialogs/DlgGraphParams'));
const DlgInlineSynthesis = React.lazy(() => import('@/dialogs/DlgInlineSynthesis'));
const DlgRelocateConstituents = React.lazy(() => import('@/dialogs/DlgRelocateConstituents'));
const DlgRenameCst = React.lazy(() => import('@/dialogs/DlgRenameCst'));
const DlgShowAST = React.lazy(() => import('@/dialogs/DlgShowAST'));
const DlgShowQR = React.lazy(() => import('@/dialogs/DlgShowQR'));
const DlgShowTypeGraph = React.lazy(() => import('@/dialogs/DlgShowTypeGraph'));
const DlgSubstituteCst = React.lazy(() => import('@/dialogs/DlgSubstituteCst'));
const DlgUploadRSForm = React.lazy(() => import('@/dialogs/DlgUploadRSForm'));

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
