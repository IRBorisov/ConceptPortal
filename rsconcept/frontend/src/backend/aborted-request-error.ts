import axios, { AxiosError, isCancel } from 'axios';

const REQUEST_ABORTED_MESSAGE = 'Request aborted';

/**
 * True for axios/browser request aborts and cancellations.
 * Timeouts stay excluded (`ECONNABORTED` with a timeout message).
 */
export function isAbortedRequestError(error: unknown): boolean {
  if (isCancel(error)) {
    return true;
  }
  if (typeof error === 'string') {
    return isAbortedRequestText(error);
  }
  if (axios.isAxiosError(error)) {
    if (error.code === AxiosError.ERR_CANCELED || error.name === 'CanceledError') {
      return true;
    }
    if (error.code === AxiosError.ECONNABORTED) {
      return isAbortedRequestText(error.message);
    }
    return isAbortedRequestText(error.message);
  }
  if (error instanceof Error) {
    return error.name === 'CanceledError' || isAbortedRequestText(error.message);
  }
  return false;
}

function isAbortedRequestText(text: string): boolean {
  return text.split('\n').some(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      return false;
    }
    if (trimmed === REQUEST_ABORTED_MESSAGE) {
      return true;
    }
    return trimmed.endsWith(`: ${REQUEST_ABORTED_MESSAGE}`);
  });
}
