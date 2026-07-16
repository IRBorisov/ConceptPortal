import { afterEach, describe, expect, it } from 'vitest';

import { usePdfExportProgressStore, withPdfExportProgress } from '../export-progress';

import { isPdfExportCancelled, PdfExportCancelledError } from './errors';
import { cancelActivePdfExport } from './worker-client';

describe('pdf export cancel', () => {
  afterEach(() => {
    usePdfExportProgressStore.setState({ activeCount: 0 });
  });

  it('recognizes PdfExportCancelledError', () => {
    expect(isPdfExportCancelled(new PdfExportCancelledError())).toBe(true);
    expect(isPdfExportCancelled(Object.assign(new Error('x'), { name: 'PdfExportCancelledError' }))).toBe(true);
    expect(isPdfExportCancelled(new Error('boom'))).toBe(false);
    expect(isPdfExportCancelled(null)).toBe(false);
  });

  it('withPdfExportProgress tracks busy count across success and failure', async () => {
    expect(usePdfExportProgressStore.getState().activeCount).toBe(0);

    await withPdfExportProgress(() => {
      expect(usePdfExportProgressStore.getState().activeCount).toBe(1);
      return Promise.resolve('ok');
    });
    expect(usePdfExportProgressStore.getState().activeCount).toBe(0);

    await expect(
      withPdfExportProgress(() => {
        expect(usePdfExportProgressStore.getState().activeCount).toBe(1);
        return Promise.reject(new Error('fail'));
      })
    ).rejects.toThrow('fail');
    expect(usePdfExportProgressStore.getState().activeCount).toBe(0);
  });

  it('store cancel aborts without leaving a stuck busy count', async () => {
    const work = withPdfExportProgress(() => {
      expect(usePdfExportProgressStore.getState().activeCount).toBe(1);
      usePdfExportProgressStore.getState().cancel();
      return Promise.reject(new PdfExportCancelledError());
    });

    await expect(work).rejects.toSatisfy(isPdfExportCancelled);
    expect(usePdfExportProgressStore.getState().activeCount).toBe(0);
    // Subsequent exports must still be allowed after cancel.
    cancelActivePdfExport();
    await withPdfExportProgress(() => Promise.resolve('ok'));
    expect(usePdfExportProgressStore.getState().activeCount).toBe(0);
  });
});
