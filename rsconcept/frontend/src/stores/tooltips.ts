import { create } from 'zustand';

import { IConstituenta } from '@/features/rsform/models/rsform';

interface TooltipsStore {
  activeCst: IConstituenta | undefined;
  setActiveCst: (value: IConstituenta | undefined) => void;
}

export const useTooltipsStore = create<TooltipsStore>()(set => ({
  activeCst: undefined,
  setActiveCst: value => set({ activeCst: value })
}));
