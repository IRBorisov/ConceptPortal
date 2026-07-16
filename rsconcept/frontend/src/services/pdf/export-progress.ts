import { create } from 'zustand';

import { cancelActivePdfExport } from './rsform/worker-client';

interface PdfExportProgressState {
  /** Number of nested {@link withPdfExportProgress} calls currently in flight. */
  activeCount: number;
  begin: () => void;
  end: () => void;
  /** Aborts the worker job(s); in-flight wrappers still run their `finally` / `end`. */
  cancel: () => void;
}

/**
 * UI-facing PDF export busy state.
 *
 * Driven by {@link withPdfExportProgress} around public export entry points so call sites do not
 * each manage an overlay.
 */
export const usePdfExportProgressStore = create<PdfExportProgressState>((set, get) => ({
  activeCount: 0,
  begin: () => set({ activeCount: get().activeCount + 1 }),
  end: () => set({ activeCount: Math.max(0, get().activeCount - 1) }),
  cancel: () => {
    cancelActivePdfExport();
  }
}));

/** Marks PDF export busy for the duration of `work` (shows {@link PdfExportOverlay}). */
export async function withPdfExportProgress<T>(work: () => Promise<T>): Promise<T> {
  usePdfExportProgressStore.getState().begin();
  try {
    return await work();
  } finally {
    usePdfExportProgressStore.getState().end();
  }
}
