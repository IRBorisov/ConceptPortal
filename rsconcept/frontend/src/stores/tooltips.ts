import { create } from 'zustand';

interface TooltipsStore {
  tooltipsEnabled: boolean;
  showTooltips: () => void;
  hideTooltips: () => void;
}

export const useTooltipsStore = create<TooltipsStore>()(set => ({
  tooltipsEnabled: true,
  showTooltips: () => set(state => (state.tooltipsEnabled === true ? state : { tooltipsEnabled: true })),
  hideTooltips: () => set(state => (state.tooltipsEnabled === false ? state : { tooltipsEnabled: false }))
}));
