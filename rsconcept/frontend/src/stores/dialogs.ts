import { create } from 'zustand';

import { DlgChangeInputSchemaProps } from '@/dialogs/DlgChangeInputSchema';
import { DlgChangeLocationProps } from '@/dialogs/DlgChangeLocation';
import { DlgCloneLibraryItemProps } from '@/dialogs/DlgCloneLibraryItem';
import { DlgCreateCstProps } from '@/dialogs/DlgCreateCst/DlgCreateCst';
import { DlgCreateOperationProps } from '@/dialogs/DlgCreateOperation/DlgCreateOperation';
import { DlgCreateVersionProps } from '@/dialogs/DlgCreateVersion';
import { DlgCstTemplateProps } from '@/dialogs/DlgCstTemplate/DlgCstTemplate';
import { DlgDeleteCstProps } from '@/dialogs/DlgDeleteCst/DlgDeleteCst';
import { DlgDeleteOperationProps } from '@/dialogs/DlgDeleteOperation';
import { DlgEditEditorsProps } from '@/dialogs/DlgEditEditors/DlgEditEditors';
import { DlgEditOperationProps } from '@/dialogs/DlgEditOperation/DlgEditOperation';
import { DlgEditReferenceProps } from '@/dialogs/DlgEditReference/DlgEditReference';
import { DlgEditVersionsProps } from '@/dialogs/DlgEditVersions/DlgEditVersions';
import { DlgEditWordFormsProps } from '@/dialogs/DlgEditWordForms/DlgEditWordForms';
import { DlgGraphParamsProps } from '@/dialogs/DlgGraphParams';
import { DlgInlineSynthesisProps } from '@/dialogs/DlgInlineSynthesis/DlgInlineSynthesis';
import { DlgRelocateConstituentsProps } from '@/dialogs/DlgRelocateConstituents';
import { DlgRenameCstProps } from '@/dialogs/DlgRenameCst';
import { DlgShowASTProps } from '@/dialogs/DlgShowAST/DlgShowAST';
import { DlgShowQRProps } from '@/dialogs/DlgShowQR';
import { DlgShowTypeGraphProps } from '@/dialogs/DlgShowTypeGraph/DlgShowTypeGraph';
import { DlgSubstituteCstProps } from '@/dialogs/DlgSubstituteCst';
import { DlgUploadRSFormProps } from '@/dialogs/DlgUploadRSForm';
import { DialogType } from '@/models/miscellaneous';

interface DialogsStore {
  active: DialogType | undefined;
  props: unknown;
  hideDialog: () => void;

  showCstTemplate: (props: DlgCstTemplateProps) => void;
  showCreateCst: (props: DlgCreateCstProps) => void;
  showCreateOperation: (props: DlgCreateOperationProps) => void;
  showDeleteCst: (props: DlgDeleteCstProps) => void;
  showEditEditors: (props: DlgEditEditorsProps) => void;
  showEditOperation: (props: DlgEditOperationProps) => void;
  showEditReference: (props: DlgEditReferenceProps) => void;
  showEditVersions: (props: DlgEditVersionsProps) => void;
  showEditWordForms: (props: DlgEditWordFormsProps) => void;
  showInlineSynthesis: (props: DlgInlineSynthesisProps) => void;
  showShowAST: (props: DlgShowASTProps) => void;
  showShowTypeGraph: (props: DlgShowTypeGraphProps) => void;
  showChangeInputSchema: (props: DlgChangeInputSchemaProps) => void;
  showChangeLocation: (props: DlgChangeLocationProps) => void;
  showCloneLibraryItem: (props: DlgCloneLibraryItemProps) => void;
  showCreateVersion: (props: DlgCreateVersionProps) => void;
  showDeleteOperation: (props: DlgDeleteOperationProps) => void;
  showGraphParams: (props: DlgGraphParamsProps) => void;
  showRelocateConstituents: (props: DlgRelocateConstituentsProps) => void;
  showRenameCst: (props: DlgRenameCstProps) => void;
  showQR: (props: DlgShowQRProps) => void;
  showSubstituteCst: (props: DlgSubstituteCstProps) => void;
  showUploadRSForm: (props: DlgUploadRSFormProps) => void;
}

export const useDialogsStore = create<DialogsStore>()(set => ({
  active: undefined,
  props: undefined,
  hideDialog: () => set({ active: undefined, props: undefined }),

  showCstTemplate: props => set({ active: DialogType.CONSTITUENTA_TEMPLATE, props: props }),
  showCreateCst: props => set({ active: DialogType.CREATE_CONSTITUENTA, props: props }),
  showCreateOperation: props => set({ active: DialogType.CREATE_OPERATION, props: props }),
  showDeleteCst: props => set({ active: DialogType.DELETE_CONSTITUENTA, props: props }),
  showEditEditors: props => set({ active: DialogType.EDIT_EDITORS, props: props }),
  showEditOperation: props => set({ active: DialogType.EDIT_OPERATION, props: props }),
  showEditReference: props => set({ active: DialogType.EDIT_REFERENCE, props: props }),
  showEditVersions: props => set({ active: DialogType.EDIT_VERSIONS, props: props }),
  showEditWordForms: props => set({ active: DialogType.EDIT_WORD_FORMS, props: props }),
  showInlineSynthesis: props => set({ active: DialogType.INLINE_SYNTHESIS, props: props }),
  showShowAST: props => set({ active: DialogType.SHOW_AST, props: props }),
  showShowTypeGraph: props => set({ active: DialogType.SHOW_TYPE_GRAPH, props: props }),
  showChangeInputSchema: props => set({ active: DialogType.CHANGE_INPUT_SCHEMA, props: props }),
  showChangeLocation: props => set({ active: DialogType.CHANGE_LOCATION, props: props }),
  showCloneLibraryItem: props => set({ active: DialogType.CLONE_LIBRARY_ITEM, props: props }),
  showCreateVersion: props => set({ active: DialogType.CREATE_VERSION, props: props }),
  showDeleteOperation: props => set({ active: DialogType.DELETE_OPERATION, props: props }),
  showGraphParams: props => set({ active: DialogType.GRAPH_PARAMETERS, props: props }),
  showRelocateConstituents: props => set({ active: DialogType.RELOCATE_CONSTITUENTS, props: props }),
  showRenameCst: props => set({ active: DialogType.RENAME_CONSTITUENTA, props: props }),
  showQR: props => set({ active: DialogType.SHOW_QR_CODE, props: props }),
  showSubstituteCst: props => set({ active: DialogType.SUBSTITUTE_CONSTITUENTS, props: props }),
  showUploadRSForm: props => set({ active: DialogType.UPLOAD_RSFORM, props: props })
}));
