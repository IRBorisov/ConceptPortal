'use client';

import { createContext, use } from 'react';

import { type UpdateConstituentaDTO } from '../../backend/types';
import { type Constituenta, type CstType, type RSForm } from '../../models/rsform';

interface IRSEditContext {
  schema: RSForm;
  selectedCst: number[];
  selectedEdges: string[];
  focusCst: Constituenta | null;
  activeCst: Constituenta | null;
  pendingActiveID: number | null;
  activeVersion?: number;

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  canDeleteSelected: boolean;
  isProcessing: boolean;

  setFocus: (newValue: Constituenta | null) => void;
  clearPendingActiveID: () => void;
  setSelectedCst: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedEdges: React.Dispatch<React.SetStateAction<string[]>>;
  selectCst: (target: number) => void;
  deselectCst: (target: number) => void;
  toggleSelectCst: (target: number) => void;
  deselectAll: () => void;

  deleteSchema: () => void;

  patchConstituenta: (data: UpdateConstituentaDTO) => Promise<void>;
  addAttribution: (attribute: Constituenta) => void;
  removeAttribution: (attribute: Constituenta) => void;
  clearAttributions: () => void;
  gotoPredecessor: (target: number, newTab?: boolean) => void;

  moveUp: () => void;
  moveDown: () => void;
  toggleCrucial: () => void;
  createCst: (type?: CstType, definition?: string) => Promise<number>;
  openTermEditor: () => void;
  promptCreateCst: (type?: CstType, definition?: string) => Promise<number | null>;
  promptRename: () => void;
  cloneCst: () => Promise<number>;
  promptDeleteSelected: () => void;
  promptTemplate: () => void;
}

export const RSEditContext = createContext<IRSEditContext | null>(null);
export const useRSFormEdit = () => {
  const context = use(RSEditContext);
  if (context === null) {
    throw new Error('useRSEdit has to be used within <RSEditState>');
  }
  return context;
};
