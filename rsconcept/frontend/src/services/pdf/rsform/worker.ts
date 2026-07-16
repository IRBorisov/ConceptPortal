/// <reference lib="webworker" />

/**
 * Dedicated worker entry for RSForm PDF generation.
 *
 * Import order matters: `worker-shim` must stay first so DOM stubs exist before `@react-pdf`
 * loads via `./document`.
 */
import '@/services/pdf/worker-shim';

import { renderCstListPdfBlob, renderSchemaPdfBlob } from './document';
import { type RsformPdfWorkerRequest, type RsformPdfWorkerResponse } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<RsformPdfWorkerRequest>) => {
  const request = event.data;
  try {
    const blob =
      request.kind === 'schema'
        ? await renderSchemaPdfBlob(request.data, request.locale)
        : await renderCstListPdfBlob(request.data, request.locale);
    const buffer = await blob.arrayBuffer();
    const response: RsformPdfWorkerResponse = { id: request.id, ok: true, buffer };
    self.postMessage(response, { transfer: [buffer] });
  } catch (error) {
    const response: RsformPdfWorkerResponse = {
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
    self.postMessage(response);
  }
};
