'use client';

import { createContext, use } from 'react';
export type UnsavedSaveHandler = () => void | Promise<void>;
export type UnsavedConfirmHandler = () => void | Promise<void>;

/** Outcome of the three-option modal. */
export type UnsavedPromptResult = 'cancel' | 'discard' | 'saved';

export interface UnsavedChangesDialogOptions {
  onSave?: UnsavedSaveHandler;
  onConfirm?: UnsavedConfirmHandler;
}

interface IUnsavedChangesContext {
  promptUnsaved: (options?: UnsavedChangesDialogOptions) => Promise<UnsavedPromptResult>;
}

export const UnsavedChangesContext = createContext<IUnsavedChangesContext | null>(null);

export const useUnsavedChanges = () => {
  const context = use(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within <UnsavedChangesState>');
  }
  return context;
};
