import { create } from 'zustand';

import { type DlgShowVideoProps } from './dlg-show-video/dlg-show-video';

export const HelpDialogType = {
  SHOW_VIDEO: 'show-video'
} as const;
export type HelpDialogType = (typeof HelpDialogType)[keyof typeof HelpDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface HelpDialogsStore {
  active: HelpDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showVideo: (props: DlgShowVideoProps) => void;
}

export const useHelpDialogsStore = create<HelpDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showVideo: props => set({ active: HelpDialogType.SHOW_VIDEO, props })
}));
