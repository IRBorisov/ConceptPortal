'use client';

import { useState } from 'react';

import { DlgUnsavedChanges } from './dlg-unsaved-navigation';
import {
  UnsavedChangesContext,
  type UnsavedChangesDialogOptions,
  type UnsavedConfirmHandler,
  type UnsavedPromptResult,
  type UnsavedSaveHandler
} from './use-unsaved-changes';

interface PendingUnsaved {
  resolve?: (result: UnsavedPromptResult) => void;
  onConfirm?: UnsavedConfirmHandler;
  onSave?: UnsavedSaveHandler;
}

export const UnsavedChangesState = ({ children }: React.PropsWithChildren) => {
  const [pending, setPending] = useState<PendingUnsaved | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function runConfirmedAction(action: UnsavedConfirmHandler | undefined): Promise<void> {
    if (!action) {
      return;
    }
    try {
      await action();
    } catch (error) {
      console.error(error);
    }
  }

  function promptUnsaved(options?: UnsavedChangesDialogOptions): Promise<UnsavedPromptResult> {
    return new Promise(resolve =>
      setPending(prev => {
        prev?.resolve?.('cancel');
        return {
          resolve: resolve,
          onSave: options?.onSave,
          onConfirm: options?.onConfirm
        };
      })
    );
  }

  function handleCancel(): void {
    if (isSaving) {
      return;
    }
    setPending(null);
    pending?.resolve?.('cancel');
  }

  async function handleContinueWithoutSaving(): Promise<void> {
    if (!pending) {
      return;
    }
    const current = pending;
    setPending(null);
    await runConfirmedAction(current.onConfirm);
    current.resolve?.('discard');
  }

  async function handleSaveAndContinue(): Promise<void> {
    const current = pending;
    const onSave = current?.onSave;
    if (!current || !onSave) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave();
      setPending(null);
      await runConfirmedAction(current.onConfirm);
      current.resolve?.('saved');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <UnsavedChangesContext
      value={{
        promptUnsaved
      }}
    >
      {children}
      <DlgUnsavedChanges
        open={!!pending}
        isSaving={isSaving}
        onCancel={handleCancel}
        onContinue={() => void handleContinueWithoutSaving()}
        onSaveAndContinue={pending?.onSave ? () => void handleSaveAndContinue() : undefined}
      />
    </UnsavedChangesContext>
  );
};
