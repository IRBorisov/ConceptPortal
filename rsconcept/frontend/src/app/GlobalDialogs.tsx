'use client';

import DlgChangeInputSchema from '@/dialogs/DlgChangeInputSchema';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import DlgCloneLibraryItem from '@/dialogs/DlgCloneLibraryItem';
import DlgCreateCst from '@/dialogs/DlgCreateCst';
import DlgCreateOperation from '@/dialogs/DlgCreateOperation';
import DlgCreateVersion from '@/dialogs/DlgCreateVersion';
import DlgCstTemplate from '@/dialogs/DlgCstTemplate';
import DlgDeleteCst from '@/dialogs/DlgDeleteCst';
import DlgDeleteOperation from '@/dialogs/DlgDeleteOperation';
import DlgEditEditors from '@/dialogs/DlgEditEditors';
import DlgEditOperation from '@/dialogs/DlgEditOperation';
import DlgEditReference from '@/dialogs/DlgEditReference';
import DlgEditVersions from '@/dialogs/DlgEditVersions';
import DlgEditWordForms from '@/dialogs/DlgEditWordForms';
import DlgGraphParams from '@/dialogs/DlgGraphParams';
import DlgInlineSynthesis from '@/dialogs/DlgInlineSynthesis';
import DlgRelocateConstituents from '@/dialogs/DlgRelocateConstituents';
import DlgRenameCst from '@/dialogs/DlgRenameCst';
import DlgShowAST from '@/dialogs/DlgShowAST';
import DlgShowQR from '@/dialogs/DlgShowQR';
import DlgShowTypeGraph from '@/dialogs/DlgShowTypeGraph';
import DlgSubstituteCst from '@/dialogs/DlgSubstituteCst';
import DlgUploadRSForm from '@/dialogs/DlgUploadRSForm';
import { DialogType } from '@/models/miscellaneous';
import { useDialogsStore } from '@/stores/dialogs';

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
