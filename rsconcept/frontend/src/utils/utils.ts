/**
 * Module: Utility functions.
 */

import { toast } from 'react-toastify';
import { type AxiosError, type AxiosHeaderValue, type AxiosResponse, isAxiosError } from 'axios';
import type z from 'zod';

import { globalTx } from '@/i18n';

import { PARAMETER } from './constants';

/** Check if Axios response is html. */
export function isResponseHtml(response?: AxiosResponse) {
  if (!response) {
    return false;
  }
  const header = response.headers['content-type'] as AxiosHeaderValue;
  if (!header) {
    return false;
  }
  if (typeof header === 'number' || typeof header === 'boolean') {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return header.includes('text/html');
}

/** Extract error message from error object. */
export function extractErrorMessage(error: Error | AxiosError): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 400) {
      const data = error.response.data as Record<string, unknown>;
      const messages = Object.entries(data).flatMap(([key, value]) => formatApiFieldError(key, value));
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }
  }
  return error.message;
}

function formatApiFieldError(key: string, value: unknown): string[] {
  if (typeof value === 'string') {
    return [`${key}: ${value}`];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map(message => `${key}: ${message}`);
  }
  return [];
}

/** Convert array of objects to CSV Blob. */
export function convertToCSV(targetObj: readonly object[]): Blob {
  if (!targetObj?.length) {
    return new Blob([], { type: 'text/csv;charset=utf-8;' });
  }
  const separator = ',';
  const keys = Object.keys(targetObj[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    (targetObj as Record<string, string | Date | number>[])
      .map(item => {
        return keys
          .map(k => {
            let cell = item[k] === null || item[k] === undefined ? '' : item[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/** Convert object or array to JSON Blob. */
export function convertToJSON(targetObj: unknown): Blob {
  const jsonString = JSON.stringify(targetObj, null, PARAMETER.indentJSON);
  return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
}

/** Read JSON file and parse it with Zod schema. */
export async function readJsonFile<T>(file: File, schema: z.ZodType<T>): Promise<T> {
  const payload = JSON.parse(await file.text()) as unknown;
  return schema.parse(payload);
}

/** Generates a QR code for the current page. */
export function generatePageQR(): string {
  const currentRef = window.location.href;
  return currentRef.includes('?') ? currentRef + '&qr' : currentRef + '?qr';
}

/** Copies sharable link to the current page. */
export function sharePage() {
  const currentRef = window.location.href;
  const url = currentRef.includes('?') ? currentRef + '&share' : currentRef + '?share';
  navigator.clipboard
    .writeText(url)
    .then(() => toast.success(globalTx('tx.general.copy.toClipboard.success')))
    .catch(error => {
      toast.error(error instanceof Error ? error.message : globalTx('tx.general.copy.toClipboard.fail'));
      console.error(error);
    });
}

/** Show error message about not implemented function. */
export function notImplemented() {
  toast.error(globalTx('tx.shell.notImplemented'));
  console.error('Not implemented');
}

/** Wrap event handler to prevent default and stop propagation. */
export function withPreventDefault<T extends React.SyntheticEvent>(handler: (event: T) => void) {
  return (event: T) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  };
}

/** Interface for keyboard event-like objects. */
export interface KeyboardEventLike {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

/** Returns true for plain text input keystrokes that should not trigger parent hotkeys. */
export function isPlainTextKey(event: KeyboardEventLike): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  return event.key.length === 1 || event.key === 'Shift';
}

/** Utility to detect iOS/iPadOS. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document)
  );
}

/** Utility to detect Mac device. */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Macintosh|MacIntel|MacPPC|Mac68K|Mac OS/i.test(navigator.userAgent);
}

/** Convert data URL to Blob. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = /:(.*?);/.exec(arr[0]);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const binary = atob(arr[1]);
  let n = binary.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = binary.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
