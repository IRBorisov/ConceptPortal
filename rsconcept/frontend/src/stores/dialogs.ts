import { create } from 'zustand';

import { type DlgChangeLocationProps } from '@/features/library/dialogs/dlg-change-location';
import { type DlgCloneLibraryItemProps } from '@/features/library/dialogs/dlg-clone-library-item';
import { type DlgCreateVersionProps } from '@/features/library/dialogs/dlg-create-version';
import { type DlgEditEditorsProps } from '@/features/library/dialogs/dlg-edit-editors/dlg-edit-editors';
import { type DlgEditVersionsProps } from '@/features/library/dialogs/dlg-edit-versions/dlg-edit-versions';
import { type DlgChangeInputSchemaProps } from '@/features/oss/dialogs/dlg-change-input-schema';
import { type DlgCreateBlockProps } from '@/features/oss/dialogs/dlg-create-block/dlg-create-block';
import { type DlgCreateOperationProps } from '@/features/oss/dialogs/dlg-create-operation/dlg-create-operation';
import { type DlgDeleteOperationProps } from '@/features/oss/dialogs/dlg-delete-operation';
import { type DlgEditOperationProps } from '@/features/oss/dialogs/dlg-edit-operation/dlg-edit-operation';
import { type DlgRelocateConstituentsProps } from '@/features/oss/dialogs/dlg-relocate-constituents';
import { type DlgCreateCstProps } from '@/features/rsform/dialogs/dlg-create-cst/dlg-create-cst';
import { type DlgCstTemplateProps } from '@/features/rsform/dialogs/dlg-cst-template/dlg-cst-template';
import { type DlgDeleteCstProps } from '@/features/rsform/dialogs/dlg-delete-cst/dlg-delete-cst';
import { type DlgEditReferenceProps } from '@/features/rsform/dialogs/dlg-edit-reference/dlg-edit-reference';
import { type DlgEditWordFormsProps } from '@/features/rsform/dialogs/dlg-edit-word-forms/dlg-edit-word-forms';
import { type DlgInlineSynthesisProps } from '@/features/rsform/dialogs/dlg-inline-synthesis/dlg-inline-synthesis';
import { type DlgRenameCstProps } from '@/features/rsform/dialogs/dlg-rename-cst';
import { type DlgShowASTProps } from '@/features/rsform/dialogs/dlg-show-ast/dlg-show-ast';
import { type DlgShowQRProps } from '@/features/rsform/dialogs/dlg-show-qr';
import { type DlgShowTypeGraphProps } from '@/features/rsform/dialogs/dlg-show-type-graph/dlg-show-type-graph';
import { type DlgSubstituteCstProps } from '@/features/rsform/dialogs/dlg-substitute-cst';
import { type DlgUploadRSFormProps } from '@/features/rsform/dialogs/dlg-upload-rsform';

/** Represents global dialog. */
export const DialogType = {
  CONSTITUENTA_TEMPLATE: 1,
  SUBSTITUTE_CONSTITUENTS: 2,

  CREATE_VERSION: 3,

  CREATE_CONSTITUENTA: 4,
  DELETE_CONSTITUENTA: 5,
  RENAME_CONSTITUENTA: 6,

  CREATE_BLOCK: 7,

  CREATE_OPERATION: 8,
  EDIT_OPERATION: 9,
  DELETE_OPERATION: 10,
  CHANGE_INPUT_SCHEMA: 11,
  RELOCATE_CONSTITUENTS: 12,

  CLONE_LIBRARY_ITEM: 13,
  UPLOAD_RSFORM: 14,
  EDIT_EDITORS: 15,
  EDIT_VERSIONS: 16,
  CHANGE_LOCATION: 17,

  EDIT_REFERENCE: 18,
  EDIT_WORD_FORMS: 19,
  INLINE_SYNTHESIS: 20,

  SHOW_QR_CODE: 21,
  SHOW_AST: 22,
  SHOW_TYPE_GRAPH: 23,
  GRAPH_PARAMETERS: 24
} as const;
export type DialogType = (typeof DialogType)[keyof typeof DialogType];

interface DialogProps {
  onHide?: () => void;
}

interface DialogsStore {
  active: DialogType | null;
  props: unknown;
  hideDialog: () => void;

  showCstTemplate: (props: DlgCstTemplateProps) => void;
  showCreateCst: (props: DlgCreateCstProps) => void;
  showCreateBlock: (props: DlgCreateBlockProps) => void;
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
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showCstTemplate: props => set({ active: DialogType.CONSTITUENTA_TEMPLATE, props: props }),
  showCreateCst: props => set({ active: DialogType.CREATE_CONSTITUENTA, props: props }),
  showCreateOperation: props => set({ active: DialogType.CREATE_OPERATION, props: props }),
  showCreateBlock: props => set({ active: DialogType.CREATE_BLOCK, props: props }),
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
  showGraphParams: () => set({ active: DialogType.GRAPH_PARAMETERS, props: null }),
  showRelocateConstituents: props => set({ active: DialogType.RELOCATE_CONSTITUENTS, props: props }),
  showRenameCst: props => set({ active: DialogType.RENAME_CONSTITUENTA, props: props }),
  showQR: props => set({ active: DialogType.SHOW_QR_CODE, props: props }),
  showSubstituteCst: props => set({ active: DialogType.SUBSTITUTE_CONSTITUENTS, props: props }),
  showUploadRSForm: props => set({ active: DialogType.UPLOAD_RSFORM, props: props })
}));
