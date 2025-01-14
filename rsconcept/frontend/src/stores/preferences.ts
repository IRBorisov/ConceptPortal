import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStore {
  showHelp: boolean;
  adminMode: boolean;
  toggleShowHelp: () => void;
  toggleAdminMode: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    set => ({
      showHelp: true,
      adminMode: false,
      toggleShowHelp: () => set(state => ({ showHelp: !state.showHelp })),
      toggleAdminMode: () => set(state => ({ adminMode: !state.adminMode }))
    }),
    {
      version: 1,
      name: 'portal.preferences'
    }
  )
);
