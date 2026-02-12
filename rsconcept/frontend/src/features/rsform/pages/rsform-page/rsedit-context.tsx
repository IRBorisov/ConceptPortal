'use client';

import { createContext, use } from 'react';

import { type Constituenta, type CstType, type RSForm } from '../../models/rsform';

interface IRSEditContext {
  schema: RSForm;
  selectedCst: number[];
  selectedEdges: string[];
  focusCst: Constituenta | null;
  activeCst: Constituenta | null;
  activeVersion?: number;

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  isAttachedToOSS: boolean;
  canDeleteSelected: boolean;

  deleteSchema: () => void;

  setFocus: (newValue: Constituenta | null) => void;
  setSelectedCst: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedEdges: React.Dispatch<React.SetStateAction<string[]>>;
  selectCst: (target: number) => void;
  deselectCst: (target: number) => void;
  toggleSelectCst: (target: number) => void;
  deselectAll: () => void;

  moveUp: () => void;
  moveDown: () => void;
  createCst: (type?: CstType, definition?: string) => Promise<number>;
  promptCreateCst: (type?: CstType, definition?: string) => Promise<number | null>;
  cloneCst: () => Promise<number>;
  promptDeleteSelected: () => void;
  promptTemplate: () => void;
}

export const RSEditContext = createContext<IRSEditContext | null>(null);
export const useRSEdit = () => {
  const context = use(RSEditContext);
  if (context === null) {
    throw new Error('useRSEdit has to be used within <RSEditState>');
  }
  return context;
};
