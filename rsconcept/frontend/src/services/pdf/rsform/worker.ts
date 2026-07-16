/// <reference lib="webworker" />

/**
 * Dedicated worker entry for RSForm PDF generation.
 *
 * Import order matters: `worker-shim` must stay first so DOM stubs exist before `@react-pdf`
 * loads via `./document`. Jobs are processed strictly one-at-a-time (async `onmessage` would
 * otherwise overlap Yoga / font state).
 */
import '@/services/pdf/worker-shim';

import { renderCstListPdfBlob, renderSchemaPdfBlob } from './document';
import { type RsformPdfWorkerRequest, type RsformPdfWorkerResponse } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

let jobChain: Promise<void> = Promise.resolve();

self.onmessage = (event: MessageEvent<RsformPdfWorkerRequest>) => {
  const request = event.data;
  jobChain = jobChain
    .then(async function runPdfJob() {
      try {
        if (
          typeof request?.id !== 'number' ||
          (request.kind !== 'schema' && request.kind !== 'cst-list') ||
          !request.locale ||
          !request.data
        ) {
          const response: RsformPdfWorkerResponse = {
            id: typeof request?.id === 'number' ? request.id : -1,
            ok: false,
            error: 'Invalid PDF worker request'
          };
          self.postMessage(response);
          return;
        }

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
    })
    .catch(function ignoreQueueError() {
      // Keep the chain alive after a rejected job.
    });
};
