/** Stable agent-facing errors independent of the calling transport. */
export class RSToolError extends Error {
  readonly code: 'NO_CURRENT_SESSION' | 'SESSION_NOT_FOUND' | 'INVALID_EVALUATE_ARGUMENTS';
  constructor(code: 'NO_CURRENT_SESSION' | 'SESSION_NOT_FOUND' | 'INVALID_EVALUATE_ARGUMENTS', message: string) {
    super(message);
    this.name = 'RSToolError';
    this.code = code;
  }
}
