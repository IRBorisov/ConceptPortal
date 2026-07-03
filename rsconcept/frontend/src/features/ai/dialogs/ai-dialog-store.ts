import { create } from 'zustand';

import { type DlgCreatePromptTemplateProps } from './dlg-create-prompt-template';

export const AiDialogType = {
  AI_PROMPT: 'ai-prompt',
  CREATE_PROMPT_TEMPLATE: 'create-prompt-template'
} as const;
export type AiDialogType = (typeof AiDialogType)[keyof typeof AiDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface AiDialogsStore {
  active: AiDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showAIPrompt: () => void;
  showCreatePromptTemplate: (props: DlgCreatePromptTemplateProps) => void;
}

export const useAiDialogsStore = create<AiDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showAIPrompt: () => set({ active: AiDialogType.AI_PROMPT, props: null }),
  showCreatePromptTemplate: props => set({ active: AiDialogType.CREATE_PROMPT_TEMPLATE, props })
}));
