import { useEffect } from 'react';

import {
  applyPreferencesStorageChange,
  startPreferencesStoragePolling,
  subscribePreferencesStorage
} from './preferences-sync';

/** Keep persisted UI preferences aligned when they change in another tab. */
export function usePreferencesSync() {
  useEffect(function subscribeCrossTabPreferences() {
    let reloadRequested = false;

    async function handlePreferencesChange(raw: string | null) {
      const action = await applyPreferencesStorageChange(raw);
      if (action === 'reload' && !reloadRequested) {
        reloadRequested = true;
        window.location.reload();
      }
    }

    const unsubscribeStorage = subscribePreferencesStorage(raw => {
      void handlePreferencesChange(raw);
    });
    const stopPolling = startPreferencesStoragePolling(raw => {
      void handlePreferencesChange(raw);
    });

    return function removePreferencesSyncListeners() {
      unsubscribeStorage();
      stopPolling();
    };
  }, []);
}
