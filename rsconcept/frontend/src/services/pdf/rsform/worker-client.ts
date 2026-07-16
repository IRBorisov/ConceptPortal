import { type AppLocale } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';

import {
  type RsformPdfWorkerRequest,
  type RsformPdfWorkerResponse,
  type SchemaPdfInput
} from './protocol';

interface PendingJob {
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
}

let worker: Worker | null = null;
let nextRequestId = 1;
const pending = new Map<number, PendingJob>();

function canUsePdfWorker(): boolean {
  return typeof Worker !== 'undefined' && import.meta.env.MODE !== 'test';
}

function rejectAllPending(error: Error) {
  for (const job of pending.values()) {
    job.reject(error);
  }
  pending.clear();
}

/**
 * Lazily creates a singleton RSForm PDF worker and wires request/response correlation.
 *
 * The worker module path must stay a static `new URL('./worker.ts', import.meta.url)` so Vite
 * emits a separate worker chunk.
 */
function getPdfWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<RsformPdfWorkerResponse>) => {
    const response = event.data;
    const job = pending.get(response.id);
    if (!job) {
      return;
    }
    pending.delete(response.id);
    if (response.ok) {
      job.resolve(new Blob([response.buffer], { type: 'application/pdf' }));
      return;
    }
    job.reject(new Error(response.error));
  };
  worker.onerror = event => {
    const error = new Error(event.message || 'PDF worker failed');
    rejectAllPending(error);
    worker?.terminate();
    worker = null;
  };
  worker.onmessageerror = () => {
    const error = new Error('PDF worker message error');
    rejectAllPending(error);
    worker?.terminate();
    worker = null;
  };

  return worker;
}

function requestPdfFromWorker(request: Omit<RsformPdfWorkerRequest, 'id'>): Promise<Blob> {
  const id = nextRequestId++;
  const workerInstance = getPdfWorker();
  const message = { ...request, id } as RsformPdfWorkerRequest;

  return new Promise<Blob>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    workerInstance.postMessage(message);
  });
}

async function renderSchemaPdfOnMainThread(data: SchemaPdfInput, locale: AppLocale): Promise<Blob> {
  const { renderSchemaPdfBlob } = await import('./document');
  return renderSchemaPdfBlob(data, locale);
}

async function renderCstListPdfOnMainThread(data: Constituenta[], locale: AppLocale): Promise<Blob> {
  const { renderCstListPdfBlob } = await import('./document');
  return renderCstListPdfBlob(data, locale);
}

/**
 * Renders a schema PDF off the UI thread when `Worker` is available.
 *
 * Falls back to a dynamic main-thread import of the document module under Vitest / environments
 * without workers (keeps the export entry chunk free of `@react-pdf`).
 */
export function renderSchemaPdfInWorker(data: SchemaPdfInput, locale: AppLocale): Promise<Blob> {
  if (!canUsePdfWorker()) {
    return renderSchemaPdfOnMainThread(data, locale);
  }
  return requestPdfFromWorker({ kind: 'schema', data, locale });
}

/**
 * Renders a constituenta-list PDF off the UI thread when `Worker` is available.
 *
 * @see {@link renderSchemaPdfInWorker}
 */
export function renderCstListPdfInWorker(data: Constituenta[], locale: AppLocale): Promise<Blob> {
  if (!canUsePdfWorker()) {
    return renderCstListPdfOnMainThread(data, locale);
  }
  return requestPdfFromWorker({ kind: 'cst-list', data, locale });
}
