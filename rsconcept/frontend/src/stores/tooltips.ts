import { create } from 'zustand';

import { type IOperation } from '@/features/oss/models/oss';
import { type IConstituenta } from '@/features/rsform/models/rsform';

interface TooltipsStore {
  activeCst: IConstituenta | null;
  setActiveCst: (value: IConstituenta | null) => void;
  activeOperation: IOperation | null;
  setActiveOperation: (value: IOperation | null) => void;
}

export const useTooltipsStore = create<TooltipsStore>()(set => ({
  activeCst: null,
  setActiveCst: value => set({ activeCst: value }),

  activeOperation: null,
  setActiveOperation: value => set({ activeOperation: value })
}));
