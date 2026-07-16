/** Thrown when the user (or a timeout path) aborts an in-flight PDF export. */
export class PdfExportCancelledError extends Error {
  constructor(message = 'PDF export cancelled') {
    super(message);
    this.name = 'PdfExportCancelledError';
  }
}

/** True when `error` is a user/system cancel of PDF export (not a hard failure). */
export function isPdfExportCancelled(error: unknown): boolean {
  return (
    error instanceof PdfExportCancelledError || (error instanceof Error && error.name === 'PdfExportCancelledError')
  );
}
