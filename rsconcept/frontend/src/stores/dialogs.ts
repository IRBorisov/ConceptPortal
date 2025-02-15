import { create } from 'zustand';

import { DlgChangeLocationProps } from '@/features/library/dialogs/DlgChangeLocation';
import { DlgCloneLibraryItemProps } from '@/features/library/dialogs/DlgCloneLibraryItem';
import { DlgCreateVersionProps } from '@/features/library/dialogs/DlgCreateVersion';
import { DlgEditEditorsProps } from '@/features/library/dialogs/DlgEditEditors/DlgEditEditors';
import { DlgEditVersionsProps } from '@/features/library/dialogs/DlgEditVersions/DlgEditVersions';
import { DlgChangeInputSchemaProps } from '@/features/oss/dialogs/DlgChangeInputSchema';
import { DlgCreateOperationProps } from '@/features/oss/dialogs/DlgCreateOperation/DlgCreateOperation';
import { DlgDeleteOperationProps } from '@/features/oss/dialogs/DlgDeleteOperation';
import { DlgEditOperationProps } from '@/features/oss/dialogs/DlgEditOperation/DlgEditOperation';
import { DlgRelocateConstituentsProps } from '@/features/oss/dialogs/DlgRelocateConstituents';
import { DlgCreateCstProps } from '@/features/rsform/dialogs/DlgCreateCst/DlgCreateCst';
import { DlgCstTemplateProps } from '@/features/rsform/dialogs/DlgCstTemplate/DlgCstTemplate';
import { DlgDeleteCstProps } from '@/features/rsform/dialogs/DlgDeleteCst/DlgDeleteCst';
import { DlgEditReferenceProps } from '@/features/rsform/dialogs/DlgEditReference/DlgEditReference';
import { DlgEditWordFormsProps } from '@/features/rsform/dialogs/DlgEditWordForms/DlgEditWordForms';
import { DlgInlineSynthesisProps } from '@/features/rsform/dialogs/DlgInlineSynthesis/DlgInlineSynthesis';
import { DlgRenameCstProps } from '@/features/rsform/dialogs/DlgRenameCst';
import { DlgShowASTProps } from '@/features/rsform/dialogs/DlgShowAST/DlgShowAST';
import { DlgShowQRProps } from '@/features/rsform/dialogs/DlgShowQR';
import { DlgShowTypeGraphProps } from '@/features/rsform/dialogs/DlgShowTypeGraph/DlgShowTypeGraph';
import { DlgSubstituteCstProps } from '@/features/rsform/dialogs/DlgSubstituteCst';
import { DlgUploadRSFormProps } from '@/features/rsform/dialogs/DlgUploadRSForm';

/**
 * Represents global dialog.
 */
export enum DialogType {
  CONSTITUENTA_TEMPLATE = 1,
  CREATE_CONSTITUENTA,
  CREATE_OPERATION,
  DELETE_CONSTITUENTA,
  EDIT_EDITORS,
  EDIT_OPERATION,
  EDIT_REFERENCE,
  EDIT_VERSIONS,
  EDIT_WORD_FORMS,
  INLINE_SYNTHESIS,
  SHOW_AST,
  SHOW_TYPE_GRAPH,
  CHANGE_INPUT_SCHEMA,
  CHANGE_LOCATION,
  CLONE_LIBRARY_ITEM,
  CREATE_VERSION,
  DELETE_OPERATION,
  GRAPH_PARAMETERS,
  RELOCATE_CONSTITUENTS,
  RENAME_CONSTITUENTA,
  SHOW_QR_CODE,
  SUBSTITUTE_CONSTITUENTS,
  UPLOAD_RSFORM
}

export interface GenericDialogProps {
  onHide?: () => void;
}

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
  showGraphParams: () => void;
  showRelocateConstituents: (props: DlgRelocateConstituentsProps) => void;
  showRenameCst: (props: DlgRenameCstProps) => void;
  showQR: (props: DlgShowQRProps) => void;
  showSubstituteCst: (props: DlgSubstituteCstProps) => void;
  showUploadRSForm: (props: DlgUploadRSFormProps) => void;
}

export const useDialogsStore = create<DialogsStore>()(set => ({
  active: undefined,
  props: undefined,
  hideDialog: () => {
    set(state => {
      (state.props as GenericDialogProps | undefined)?.onHide?.();
      return { active: undefined, props: undefined };
    });
  },

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
  showGraphParams: () => set({ active: DialogType.GRAPH_PARAMETERS, props: undefined }),
  showRelocateConstituents: props => set({ active: DialogType.RELOCATE_CONSTITUENTS, props: props }),
  showRenameCst: props => set({ active: DialogType.RENAME_CONSTITUENTA, props: props }),
  showQR: props => set({ active: DialogType.SHOW_QR_CODE, props: props }),
  showSubstituteCst: props => set({ active: DialogType.SUBSTITUTE_CONSTITUENTS, props: props }),
  showUploadRSForm: props => set({ active: DialogType.UPLOAD_RSFORM, props: props })
}));
