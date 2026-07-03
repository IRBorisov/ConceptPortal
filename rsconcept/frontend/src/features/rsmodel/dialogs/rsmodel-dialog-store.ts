import { create } from 'zustand';

import { type DlgEditBindingProps } from './dlg-edit-binding';
import { type DlgEditValueProps } from './dlg-edit-value';
import { type DlgViewValueProps } from './dlg-view-value';

export const RsmodelDialogType = {
  EDIT_VALUE: 'edit-value',
  VIEW_VALUE: 'view-value',
  EDIT_BINDING: 'edit-binding'
} as const;
export type RsmodelDialogType = (typeof RsmodelDialogType)[keyof typeof RsmodelDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface RsmodelDialogsStore {
  active: RsmodelDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showModelEditValue: (props: DlgEditValueProps) => void;
  showModelViewValue: (props: DlgViewValueProps) => void;
  showModelEditBinding: (props: DlgEditBindingProps) => void;
}

export const useRsmodelDialogsStore = create<RsmodelDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showModelEditValue: props => set({ active: RsmodelDialogType.EDIT_VALUE, props }),
  showModelViewValue: props => set({ active: RsmodelDialogType.VIEW_VALUE, props }),
  showModelEditBinding: props => set({ active: RsmodelDialogType.EDIT_BINDING, props })
}));
