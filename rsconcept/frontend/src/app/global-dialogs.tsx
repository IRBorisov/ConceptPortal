'use client';

import React from 'react';

import { DialogType, useDialogsStore } from '@/stores/dialogs';

const DlgChangeInputSchema = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-change-input-schema').then(module => ({ default: module.DlgChangeInputSchema }))
);
const DlgChangeLocation = React.lazy(() =>
  import('@/features/library/dialogs/dlg-change-location').then(module => ({
    default: module.DlgChangeLocation
  }))
);
const DlgCloneLibraryItem = React.lazy(() =>
  import('@/features/library/dialogs/dlg-clone-library-item').then(module => ({
    default: module.DlgCloneLibraryItem
  }))
);
const DlgCreateCst = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-create-cst').then(module => ({ default: module.DlgCreateCst }))
);
const DlgCreateSynthesis = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-create-synthesis').then(module => ({
    default: module.DlgCreateSynthesis
  }))
);
const DlgCreateVersion = React.lazy(() =>
  import('@/features/library/dialogs/dlg-create-version').then(module => ({
    default: module.DlgCreateVersion
  }))
);
const DlgCstTemplate = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-cst-template').then(module => ({
    default: module.DlgCstTemplate
  }))
);
const DlgDeleteCst = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-delete-cst').then(module => ({
    default: module.DlgDeleteCst
  }))
);
const DlgDeleteOperation = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-delete-operation').then(module => ({
    default: module.DlgDeleteOperation
  }))
);
const DlgEditEditors = React.lazy(() =>
  import('@/features/library/dialogs/dlg-edit-editors').then(module => ({
    default: module.DlgEditEditors
  }))
);
const DlgEditOperation = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-edit-operation').then(module => ({
    default: module.DlgEditOperation
  }))
);
const DlgEditReference = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-edit-reference').then(module => ({
    default: module.DlgEditReference
  }))
);
const DlgEditVersions = React.lazy(() =>
  import('@/features/library/dialogs/dlg-edit-versions').then(module => ({
    default: module.DlgEditVersions
  }))
);
const DlgEditWordForms = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-edit-word-forms').then(module => ({
    default: module.DlgEditWordForms
  }))
);
const DlgInlineSynthesis = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-inline-synthesis').then(module => ({
    default: module.DlgInlineSynthesis
  }))
);
const DlgRelocateConstituents = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-relocate-constituents').then(module => ({
    default: module.DlgRelocateConstituents
  }))
);
const DlgRenameCst = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-rename-cst').then(module => ({
    default: module.DlgRenameCst
  }))
);
const DlgShowAST = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-show-ast').then(module => ({
    default: module.DlgShowAST
  }))
);
const DlgShowQR = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-show-qr').then(module => ({
    default: module.DlgShowQR
  }))
);
const DlgShowTypeGraph = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-show-type-graph').then(module => ({
    default: module.DlgShowTypeGraph
  }))
);
const DlgSubstituteCst = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-substitute-cst').then(module => ({
    default: module.DlgSubstituteCst
  }))
);
const DlgUploadRSForm = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-upload-rsform').then(module => ({
    default: module.DlgUploadRSForm
  }))
);
const DlgGraphParams = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-graph-params').then(module => ({ default: module.DlgGraphParams }))
);
const DlgCreateBlock = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-create-block').then(module => ({
    default: module.DlgCreateBlock
  }))
);
const DlgEditBlock = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-edit-block').then(module => ({
    default: module.DlgEditBlock
  }))
);
const DlgOssSettings = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-oss-settings').then(module => ({
    default: module.DlgOssSettings
  }))
);
const DlgEditCst = React.lazy(() =>
  import('@/features/rsform/dialogs/dlg-edit-cst').then(module => ({ default: module.DlgEditCst }))
);
const DlgShowTermGraph = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-show-term-graph').then(module => ({ default: module.DlgShowTermGraph }))
);
const DlgCreateSchema = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-create-schema').then(module => ({ default: module.DlgCreateSchema }))
);
const DlgImportSchema = React.lazy(() =>
  import('@/features/oss/dialogs/dlg-import-schema').then(module => ({ default: module.DlgImportSchema }))
);
const DlgAIPromptDialog = React.lazy(() =>
  import('@/features/ai/dialogs/dlg-ai-prompt').then(module => ({ default: module.DlgAIPromptDialog }))
);
const DlgCreatePromptTemplate = React.lazy(() =>
  import('@/features/ai/dialogs/dlg-create-prompt-template').then(module => ({
    default: module.DlgCreatePromptTemplate
  }))
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
    case DialogType.CREATE_SYNTHESIS:
      return <DlgCreateSynthesis />;
    case DialogType.CREATE_BLOCK:
      return <DlgCreateBlock />;
    case DialogType.EDIT_BLOCK:
      return <DlgEditBlock />;
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
    case DialogType.OSS_SETTINGS:
      return <DlgOssSettings />;
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
    case DialogType.EDIT_CONSTITUENTA:
      return <DlgEditCst />;
    case DialogType.SHOW_TERM_GRAPH:
      return <DlgShowTermGraph />;
    case DialogType.CREATE_SCHEMA:
      return <DlgCreateSchema />;
    case DialogType.IMPORT_SCHEMA:
      return <DlgImportSchema />;
    case DialogType.AI_PROMPT:
      return <DlgAIPromptDialog />;
    case DialogType.CREATE_PROMPT_TEMPLATE:
      return <DlgCreatePromptTemplate />;
  }
};
