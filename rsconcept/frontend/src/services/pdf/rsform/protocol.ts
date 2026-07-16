import { type AppLocale } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';

/**
 * Structured-clone-safe schema payload for PDF export / worker messages.
 *
 * Omits non-cloneable `RSForm` fields (`graph`, `analyzer`, …). Only the fields consumed by the
 * schema PDF title, table, and footer are included.
 */
export interface SchemaPdfInput {
  /** Library item id (used in the Portal source URL). */
  id: number;
  /** Schema display title. */
  title: string;
  /** Short alias shown in the title block and footer. */
  alias: string;
  /** Constituents rendered as table rows (order preserved). */
  items: Constituenta[];
}

/**
 * Request posted from the main thread to the RSForm PDF worker.
 *
 * `id` correlates the response. `kind` selects the document tree; `locale` is applied via
 * `PdfIntlRoot` inside the worker.
 */
export type RsformPdfWorkerRequest =
  | {
      /** Correlation id for {@link RsformPdfWorkerResponse}. */
      id: number;
      kind: 'schema';
      locale: AppLocale;
      data: SchemaPdfInput;
    }
  | {
      id: number;
      kind: 'cst-list';
      locale: AppLocale;
      data: Constituenta[];
    };

/**
 * Response from the RSForm PDF worker.
 *
 * On success, `buffer` is the PDF bytes (often transferred, not copied). On failure, `error` is a
 * message string suitable for logging / toasts.
 */
export type RsformPdfWorkerResponse =
  | {
      id: number;
      ok: true;
      /** Raw PDF file contents (`application/pdf`). */
      buffer: ArrayBuffer;
    }
  | {
      id: number;
      ok: false;
      error: string;
    };
