import { create } from 'zustand';

import { type IOperation } from '../models/oss';

interface OperationTooltipStore {
  activeOperation: IOperation | null;
  setActiveOperation: (value: IOperation | null) => void;
}

export const useOperationTooltipStore = create<OperationTooltipStore>()(set => ({
  activeOperation: null,
  setActiveOperation: value => set({ activeOperation: value })
}));
