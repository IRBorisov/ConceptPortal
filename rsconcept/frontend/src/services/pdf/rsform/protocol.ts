import { type AppLocale } from '@/i18n';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { labelType } from '@rsconcept/domain/rslang/labels';

/**
 * Minimal constituenta fields needed to render one PDF table row.
 *
 * Built on the main thread so the worker never receives full `Constituenta` graphs
 * (diagnostics, analysis, spawn, …) or needs `labelType`.
 */
export interface ConstituentaPdfRow {
  /** Stable row key (constituenta id). */
  id: number;
  /** Alias shown in the ID column (e.g. `X1`). */
  alias: string;
  /** Formal definition expression. */
  definition_formal: string;
  /** Precomputed typification label (`labelType(effectiveType)`). */
  typification: string;
  /** Resolved term text. */
  term_resolved: string;
  /** Resolved textual definition. */
  definition_resolved: string;
  /** Convention text; empty when absent. */
  convention: string;
}

/**
 * Structured-clone-safe schema payload for PDF export / worker messages.
 *
 * Omits non-cloneable `RSForm` fields (`graph`, `analyzer`, …) and trims each item to
 * {@link ConstituentaPdfRow}.
 */
export interface SchemaPdfInput {
  /** Library item id (used in the Portal source URL). */
  id: number;
  /** Schema display title. */
  title: string;
  /** Short alias shown in the title block and footer. */
  alias: string;
  /** Constituents rendered as table rows (order preserved). */
  items: ConstituentaPdfRow[];
}

/**
 * Request posted from the main thread to the RSForm PDF worker.
 *
 * `id` correlates the response; `kind` selects the document tree.
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
      data: ConstituentaPdfRow[];
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

/** Maps a live constituenta to the fields the PDF table actually reads. */
export function toConstituentaPdfRow(cst: Constituenta): ConstituentaPdfRow {
  return {
    id: cst.id,
    alias: cst.alias,
    definition_formal: cst.definition_formal,
    typification: labelType(cst.effectiveType),
    term_resolved: cst.term_resolved,
    definition_resolved: cst.definition_resolved,
    convention: cst.convention
  };
}

/** Picks serializable schema fields and trims each item to {@link ConstituentaPdfRow}. */
export function toSchemaPdfInput(data: RSForm): SchemaPdfInput {
  return {
    id: data.id,
    title: data.title,
    alias: data.alias,
    items: data.items.map(toConstituentaPdfRow)
  };
}
