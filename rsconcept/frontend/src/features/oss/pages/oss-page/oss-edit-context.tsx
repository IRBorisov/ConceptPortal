'use client';

import { createContext, use } from 'react';

import { type Operation, type OperationSchema, type OssItem } from '../../models/oss';

export const OssTabID = {
  CARD: 0,
  GRAPH: 1
} as const;
export type OssTabID = (typeof OssTabID)[keyof typeof OssTabID];

interface IOssEditContext {
  schema: OperationSchema;
  selectedNodes: string[];
  selectedEdges: string[];
  selectedItems: OssItem[];
  canDeleteSelected: boolean;

  isOwned: boolean;
  isMutable: boolean;

  canDeleteOperation: (target: Operation) => boolean;
  deleteSchema: () => void;
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedEdges: React.Dispatch<React.SetStateAction<string[]>>;
  deselectAll: () => void;
}

export const OssEditContext = createContext<IOssEditContext | null>(null);
export const useOssEdit = () => {
  const context = use(OssEditContext);
  if (context === null) {
    throw new Error('useOssEdit has to be used within <OssEditState>');
  }
  return context;
};
