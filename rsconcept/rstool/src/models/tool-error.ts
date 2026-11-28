export const RSTOOL_ERROR_CODES = ['NO_CURRENT_SESSION', 'SESSION_NOT_FOUND', 'INVALID_EVALUATE_ARGUMENTS'] as const;

/** Stable agent-facing errors independent of the calling transport. */
export class RSToolError extends Error {
  readonly code: typeof RSTOOL_ERROR_CODES[number];
  constructor(code: RSToolError['code'], message: string) {
    super(message);
    this.name = 'RSToolError';
    this.code = code;
  }
}
