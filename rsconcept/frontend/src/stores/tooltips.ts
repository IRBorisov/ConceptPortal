import { create } from 'zustand';

import { IConstituenta } from '@/features/rsform/models/rsform';

interface TooltipsStore {
  activeCst: IConstituenta | null;
  setActiveCst: (value: IConstituenta | null) => void;
}

export const useTooltipsStore = create<TooltipsStore>()(set => ({
  activeCst: null,
  setActiveCst: value => set({ activeCst: value })
}));
