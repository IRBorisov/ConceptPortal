import { toast } from 'react-toastify';

import { globalTx } from '@/i18n';

import { useModificationStore } from '@/stores/modification';

let openSchemaItemId: number | undefined;

/** Register the RSForm currently open in an editor shell (RSForm page, RSModel page, etc.). */
export function setOpenSchemaItemId(itemID: number | undefined): void {
  openSchemaItemId = itemID;
}

/** Item id from the current concept editor route (`/rsforms/:id`, `/oss/:id`, `/models/:id`). */
export function getOpenConceptItemId(): number | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const match = /(?:^|\/)(?:rsforms|oss|models)\/(\d+)/.exec(window.location.pathname);
  return match ? Number(match[1]) : undefined;
}

/** True when this tab is editing the given library item (direct route or embedded schema editor). */
export function isEditingSyncedItem(itemID: number): boolean {
  return getOpenConceptItemId() === itemID || openSchemaItemId === itemID;
}

/**
 * Capture unsaved-edit state before applying cross-tab cache updates.
 * Call the returned function to toast and clear the modified flag.
 */
export function prepareCrossTabDataReset(itemID: number): () => void {
  const shouldNotify = isEditingSyncedItem(itemID) && useModificationStore.getState().isModified;
  return () => {
    if (!shouldNotify) {
      return;
    }
    useModificationStore.getState().setIsModified(false);
    toast.info(globalTx('tx.general.changes.crossTab.reset'));
  };
}

/**
 * Toast and clear the modified flag when another tab updates the item currently being edited.
 * Prefer `prepareCrossTabDataReset` in sync handlers so the check runs before cache writes.
 */
export function notifyCrossTabDataReset(itemID: number): void {
  prepareCrossTabDataReset(itemID)();
}
