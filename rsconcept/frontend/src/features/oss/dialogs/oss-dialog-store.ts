import { create } from 'zustand';

import { type DlgCreateBlockProps } from './dlg-create-block/dlg-create-block';
import { type DlgCreateSynthesisProps } from './dlg-create-synthesis/dlg-create-synthesis';
import { type DlgEditOperationProps } from './dlg-edit-operation/dlg-edit-operation';
import { type DlgChangeInputSchemaProps } from './dlg-change-input-schema';
import { type DlgCreateSchemaProps } from './dlg-create-schema';
import { type DlgDeleteOperationProps } from './dlg-delete-operation';
import { type DlgDeleteReplicaProps } from './dlg-delete-replica';
import { type DlgEditBlockProps } from './dlg-edit-block';
import { type DlgImportSchemaProps } from './dlg-import-schema';
import { type DlgRelocateConstituentsProps } from './dlg-relocate-constituents';

export const OssDialogType = {
  CREATE_SYNTHESIS: 'create-synthesis',
  CREATE_BLOCK: 'create-block',
  EDIT_BLOCK: 'edit-block',
  EDIT_OPERATION: 'edit-operation',
  DELETE_OPERATION: 'delete-operation',
  DELETE_REFERENCE: 'delete-reference',
  CHANGE_INPUT_SCHEMA: 'change-input-schema',
  RELOCATE_CONSTITUENTS: 'relocate-constituents',
  OSS_SETTINGS: 'oss-settings',
  CREATE_SCHEMA: 'create-schema',
  IMPORT_SCHEMA: 'import-schema'
} as const;
export type OssDialogType = (typeof OssDialogType)[keyof typeof OssDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface OssDialogsStore {
  active: OssDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showCreateSynthesis: (props: DlgCreateSynthesisProps) => void;
  showCreateBlock: (props: DlgCreateBlockProps) => void;
  showEditBlock: (props: DlgEditBlockProps) => void;
  showEditOperation: (props: DlgEditOperationProps) => void;
  showDeleteOperation: (props: DlgDeleteOperationProps) => void;
  showDeleteReference: (props: DlgDeleteReplicaProps) => void;
  showChangeInputSchema: (props: DlgChangeInputSchemaProps) => void;
  showRelocateConstituents: (props: DlgRelocateConstituentsProps) => void;
  showOssOptions: () => void;
  showCreateSchema: (props: DlgCreateSchemaProps) => void;
  showImportSchema: (props: DlgImportSchemaProps) => void;
}

export const useOssDialogsStore = create<OssDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showCreateSynthesis: props => set({ active: OssDialogType.CREATE_SYNTHESIS, props }),
  showCreateBlock: props => set({ active: OssDialogType.CREATE_BLOCK, props }),
  showEditBlock: props => set({ active: OssDialogType.EDIT_BLOCK, props }),
  showEditOperation: props => set({ active: OssDialogType.EDIT_OPERATION, props }),
  showDeleteOperation: props => set({ active: OssDialogType.DELETE_OPERATION, props }),
  showDeleteReference: props => set({ active: OssDialogType.DELETE_REFERENCE, props }),
  showChangeInputSchema: props => set({ active: OssDialogType.CHANGE_INPUT_SCHEMA, props }),
  showRelocateConstituents: props => set({ active: OssDialogType.RELOCATE_CONSTITUENTS, props }),
  showOssOptions: () => set({ active: OssDialogType.OSS_SETTINGS, props: null }),
  showCreateSchema: props => set({ active: OssDialogType.CREATE_SCHEMA, props }),
  showImportSchema: props => set({ active: OssDialogType.IMPORT_SCHEMA, props })
}));
