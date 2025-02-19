'use client';

import React from 'react';

import { DialogType, useDialogsStore } from '@/stores/dialogs';

const DlgChangeInputSchema = React.lazy(() =>
  import('@/features/oss/dialogs/DlgChangeInputSchema').then(module => ({ default: module.DlgChangeInputSchema }))
);
const DlgChangeLocation = React.lazy(() =>
  import('@/features/library/dialogs/DlgChangeLocation').then(module => ({
    default: module.DlgChangeLocation
  }))
);
const DlgCloneLibraryItem = React.lazy(() =>
  import('@/features/library/dialogs/DlgCloneLibraryItem').then(module => ({
    default: module.DlgCloneLibraryItem
  }))
);
const DlgCreateCst = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgCreateCst').then(module => ({ default: module.DlgCreateCst }))
);
const DlgCreateOperation = React.lazy(() =>
  import('@/features/oss/dialogs/DlgCreateOperation').then(module => ({
    default: module.DlgCreateOperation
  }))
);
const DlgCreateVersion = React.lazy(() =>
  import('@/features/library/dialogs/DlgCreateVersion').then(module => ({
    default: module.DlgCreateVersion
  }))
);
const DlgCstTemplate = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgCstTemplate').then(module => ({
    default: module.DlgCstTemplate
  }))
);
const DlgDeleteCst = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgDeleteCst').then(module => ({
    default: module.DlgDeleteCst
  }))
);
const DlgDeleteOperation = React.lazy(() =>
  import('@/features/oss/dialogs/DlgDeleteOperation').then(module => ({
    default: module.DlgDeleteOperation
  }))
);
const DlgEditEditors = React.lazy(() =>
  import('@/features/library/dialogs/DlgEditEditors').then(module => ({
    default: module.DlgEditEditors
  }))
);
const DlgEditOperation = React.lazy(() =>
  import('@/features/oss/dialogs/DlgEditOperation').then(module => ({
    default: module.DlgEditOperation
  }))
);
const DlgEditReference = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgEditReference').then(module => ({
    default: module.DlgEditReference
  }))
);
const DlgEditVersions = React.lazy(() =>
  import('@/features/library/dialogs/DlgEditVersions').then(module => ({
    default: module.DlgEditVersions
  }))
);
const DlgEditWordForms = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgEditWordForms').then(module => ({
    default: module.DlgEditWordForms
  }))
);
const DlgInlineSynthesis = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgInlineSynthesis').then(module => ({
    default: module.DlgInlineSynthesis
  }))
);
const DlgRelocateConstituents = React.lazy(() =>
  import('@/features/oss/dialogs/DlgRelocateConstituents').then(module => ({
    default: module.DlgRelocateConstituents
  }))
);
const DlgRenameCst = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgRenameCst').then(module => ({
    default: module.DlgRenameCst
  }))
);
const DlgShowAST = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgShowAST').then(module => ({
    default: module.DlgShowAST
  }))
);
const DlgShowQR = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgShowQR').then(module => ({
    default: module.DlgShowQR
  }))
);
const DlgShowTypeGraph = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgShowTypeGraph').then(module => ({
    default: module.DlgShowTypeGraph
  }))
);
const DlgSubstituteCst = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgSubstituteCst').then(module => ({
    default: module.DlgSubstituteCst
  }))
);
const DlgUploadRSForm = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgUploadRSForm').then(module => ({
    default: module.DlgUploadRSForm
  }))
);
const DlgGraphParams = React.lazy(() =>
  import('@/features/rsform/dialogs/DlgGraphParams').then(module => ({ default: module.DlgGraphParams }))
);

export const GlobalDialogs = () => {
  const active = useDialogsStore(state => state.active);

  if (active === null) {
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
