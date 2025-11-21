'use client';

import { createContext, use } from 'react';

import { type CstType } from '../../backend/types';
import { type IConstituenta, type IRSForm } from '../../models/rsform';

export const RSTabID = {
  CARD: 0,
  CST_LIST: 1,
  CST_EDIT: 2,
  GRAPH: 3
} as const;
export type RSTabID = (typeof RSTabID)[keyof typeof RSTabID];

interface IRSEditContext {
  schema: IRSForm;
  selectedCst: number[];
  selectedEdges: string[];
  focusCst: IConstituenta | null;
  activeCst: IConstituenta | null;
  activeVersion?: number;

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  isAttachedToOSS: boolean;
  canDeleteSelected: boolean;

  navigateVersion: (versionID?: number) => void;
  navigateRSForm: ({ tab, activeID }: { tab: RSTabID; activeID?: number }) => void;
  navigateCst: (cstID: number) => void;
  navigateOss: (ossID: number, newTab?: boolean) => void;

  deleteSchema: () => void;

  setFocus: (newValue: IConstituenta | null) => void;
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
