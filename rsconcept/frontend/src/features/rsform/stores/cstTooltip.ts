import { create } from 'zustand';

import { type IConstituenta } from '../models/rsform';

interface CstTooltipStore {
  activeCst: IConstituenta | null;
  setActiveCst: (value: IConstituenta | null) => void;
}

export const useCstTooltipStore = create<CstTooltipStore>()(set => ({
  activeCst: null,
  setActiveCst: value => set({ activeCst: value })
}));
