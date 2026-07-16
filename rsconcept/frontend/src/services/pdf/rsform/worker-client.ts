import { type AppLocale } from '@/i18n';

import {
  type ConstituentaPdfRow,
  type RsformPdfWorkerRequest,
  type RsformPdfWorkerResponse,
  type SchemaPdfInput
} from './protocol';

/** Max time for one worker job before the singleton is terminated and recreated. */
const PDF_WORKER_TIMEOUT_MS = 120_000;

interface PendingJob {
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

let worker: Worker | null = null;
let nextRequestId = 1;
const pending = new Map<number, PendingJob>();

/** Ensures at most one job is posted/awaited at a time (client-side queue). */
let jobQueue: Promise<unknown> = Promise.resolve();

function canUsePdfWorker(): boolean {
  return typeof Worker !== 'undefined' && import.meta.env.MODE !== 'test';
}

function clearPendingJob(id: number): PendingJob | undefined {
  const job = pending.get(id);
  if (!job) {
    return undefined;
  }
  clearTimeout(job.timeoutId);
  pending.delete(id);
  return job;
}

function rejectAllPending(error: Error) {
  for (const [id, job] of pending) {
    clearTimeout(job.timeoutId);
    pending.delete(id);
    job.reject(error);
  }
}

function resetWorker() {
  worker?.terminate();
  worker = null;
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
    if (typeof response?.id !== 'number' || typeof response.ok !== 'boolean') {
      return;
    }
    const job = clearPendingJob(response.id);
    if (!job) {
      return;
    }
    if (response.ok) {
      job.resolve(new Blob([response.buffer], { type: 'application/pdf' }));
      return;
    }
    job.reject(new Error(response.error));
  };
  worker.onerror = event => {
    const error = new Error(event.message || 'PDF worker failed');
    rejectAllPending(error);
    resetWorker();
  };
  worker.onmessageerror = () => {
    const error = new Error('PDF worker message error');
    rejectAllPending(error);
    resetWorker();
  };

  return worker;
}

function requestPdfFromWorker(request: Omit<RsformPdfWorkerRequest, 'id'>): Promise<Blob> {
  const run = async () => {
    const id = nextRequestId++;
    const workerInstance = getPdfWorker();
    const message = { ...request, id } as RsformPdfWorkerRequest;

    return await new Promise<Blob>((resolve, reject) => {
      const timeoutId = setTimeout(function onPdfWorkerTimeout() {
        pending.delete(id);
        resetWorker();
        reject(new Error(`PDF worker timed out after ${PDF_WORKER_TIMEOUT_MS}ms`));
      }, PDF_WORKER_TIMEOUT_MS);

      pending.set(id, { resolve, reject, timeoutId });
      workerInstance.postMessage(message);
    });
  };

  const result = jobQueue.then(run, run);
  jobQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function renderSchemaPdfOnMainThread(data: SchemaPdfInput, locale: AppLocale): Promise<Blob> {
  const { renderSchemaPdfBlob } = await import('./document');
  return renderSchemaPdfBlob(data, locale);
}

async function renderCstListPdfOnMainThread(data: ConstituentaPdfRow[], locale: AppLocale): Promise<Blob> {
  const { renderCstListPdfBlob } = await import('./document');
  return renderCstListPdfBlob(data, locale);
}

/**
 * Renders a schema PDF off the UI thread when `Worker` is available.
 *
 * Jobs are queued one-at-a-time. A hung `toBlob()` triggers terminate/recreate after
 * {@link PDF_WORKER_TIMEOUT_MS}. Falls back to a dynamic main-thread import under Vitest /
 * environments without workers.
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
export function renderCstListPdfInWorker(data: ConstituentaPdfRow[], locale: AppLocale): Promise<Blob> {
  if (!canUsePdfWorker()) {
    return renderCstListPdfOnMainThread(data, locale);
  }
  return requestPdfFromWorker({ kind: 'cst-list', data, locale });
}
