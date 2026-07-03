import { create } from 'zustand';

import { type DlgEditEditorsProps } from './dlg-edit-editors/dlg-edit-editors';
import { type DlgEditVersionsProps } from './dlg-edit-versions/dlg-edit-versions';
import { type DlgChangeLocationProps } from './dlg-change-location';
import { type DlgCloneLibraryItemProps } from './dlg-clone-library-item';
import { type DlgCreateVersionProps } from './dlg-create-version';

export const LibraryDialogType = {
  CHANGE_LOCATION: 'change-location',
  CLONE_LIBRARY_ITEM: 'clone-library-item',
  CREATE_VERSION: 'create-version',
  EDIT_EDITORS: 'edit-editors',
  EDIT_VERSIONS: 'edit-versions'
} as const;
export type LibraryDialogType = (typeof LibraryDialogType)[keyof typeof LibraryDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface LibraryDialogsStore {
  active: LibraryDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showChangeLocation: (props: DlgChangeLocationProps) => void;
  showCloneLibraryItem: (props: DlgCloneLibraryItemProps) => void;
  showCreateVersion: (props: DlgCreateVersionProps) => void;
  showEditEditors: (props: DlgEditEditorsProps) => void;
  showEditVersions: (props: DlgEditVersionsProps) => void;
}

export const useLibraryDialogsStore = create<LibraryDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showChangeLocation: props => set({ active: LibraryDialogType.CHANGE_LOCATION, props }),
  showCloneLibraryItem: props => set({ active: LibraryDialogType.CLONE_LIBRARY_ITEM, props }),
  showCreateVersion: props => set({ active: LibraryDialogType.CREATE_VERSION, props }),
  showEditEditors: props => set({ active: LibraryDialogType.EDIT_EDITORS, props }),
  showEditVersions: props => set({ active: LibraryDialogType.EDIT_VERSIONS, props })
}));
