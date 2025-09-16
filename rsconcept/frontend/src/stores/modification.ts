import { create } from 'zustand';

interface ModificationStore {
  isModified: boolean;
  setIsModified: (value: boolean) => void;
}

export const useModificationStore = create<ModificationStore>()(set => ({
  isModified: false,
  setIsModified: value => set(state => (state.isModified === value ? state : { isModified: value }))
}));
