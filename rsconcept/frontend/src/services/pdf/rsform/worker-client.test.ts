import { beforeEach, describe, expect, it, vi } from 'vitest';

const documentMock = vi.hoisted(() => {
  let renderCalls = 0;
  let finishFirst: ((blob: Blob) => void) | undefined;

  return {
    reset() {
      renderCalls = 0;
      finishFirst = undefined;
    },
    finishFirstRender(blob = new Blob(['stale'], { type: 'application/pdf' })) {
      finishFirst?.(blob);
    },
    renderCstListPdfBlob: vi.fn(() => {
      renderCalls += 1;
      if (renderCalls === 1) {
        return new Promise<Blob>(resolve => {
          finishFirst = resolve;
        });
      }
      return Promise.resolve(new Blob([`pdf-${renderCalls}`], { type: 'application/pdf' }));
    }),
    renderSchemaPdfBlob: vi.fn(() => Promise.resolve(new Blob(['schema'], { type: 'application/pdf' })))
  };
});

vi.mock('./document', () => ({
  renderCstListPdfBlob: documentMock.renderCstListPdfBlob,
  renderSchemaPdfBlob: documentMock.renderSchemaPdfBlob
}));

describe('pdf worker-client preemption', () => {
  beforeEach(() => {
    documentMock.reset();
    vi.clearAllMocks();
  });

  it('a new PDF request preempts an in-flight main-thread export', async () => {
    const { renderCstListPdfInWorker } = await import('./worker-client');
    const { isPdfExportCancelled } = await import('./errors');

    const first = renderCstListPdfInWorker([], 'en');
    await vi.waitFor(() => {
      expect(documentMock.renderCstListPdfBlob).toHaveBeenCalledTimes(1);
    });

    const second = renderCstListPdfInWorker([], 'en');
    // Main-thread cancel is observed after the deferred render settles.
    documentMock.finishFirstRender();

    await expect(first).rejects.toSatisfy(isPdfExportCancelled);
    await expect(second).resolves.toBeInstanceOf(Blob);
    expect(documentMock.renderCstListPdfBlob).toHaveBeenCalledTimes(2);
  });
});
