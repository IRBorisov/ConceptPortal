import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DialogType, useDialogsStore } from '@/stores/dialogs';

import { GlobalDialogs } from './global-dialogs';

function getHandledDialogTypeCases() {
  const filePath = resolve(import.meta.dirname, 'global-dialogs.tsx');
  const source = readFileSync(filePath, 'utf8');

  return [...source.matchAll(/case DialogType\.([A-Z_]+):/g)].map(([, key]) => key);
}

describe('GlobalDialogs', () => {
  it('renders nothing when no dialog is active', () => {
    useDialogsStore.setState({ active: null, props: null });

    const html = renderToStaticMarkup(<GlobalDialogs />);

    expect(html).toBe('');
  });

  it('handles every DialogType in switch cases', () => {
    const handledCases = new Set(getHandledDialogTypeCases());
    const dialogTypeKeys = Object.keys(DialogType);

    expect(handledCases).toEqual(new Set(dialogTypeKeys));
    expect(handledCases.size).toBe(dialogTypeKeys.length);
  });
});
