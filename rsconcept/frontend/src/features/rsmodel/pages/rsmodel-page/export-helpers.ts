import { toast } from 'react-toastify';

import { errorMsg } from '@/utils/labels';

/** Serialize a value for JSON export (clipboard / file). */
export function getExportJsonText(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** Copy JSON text to the clipboard; reports failures via toast and console. */
export function copyJsonToClipboard(jsonText: string, onSuccess?: () => void): void {
  void navigator.clipboard.writeText(jsonText).then(
    () => {
      onSuccess?.();
    },
    (error: unknown) => {
      toast.error(error instanceof Error ? error.message : (errorMsg.clipboardWrite as string));
      console.error(error);
    }
  );
}

/** Trigger a download of JSON text; reports failures via toast and console. */
export function downloadJsonFile(jsonText: string, filename: string): void {
  try {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : errorMsg.fileRead);
    console.error(error);
  }
}
