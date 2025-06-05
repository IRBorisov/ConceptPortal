'use client';

import { createContext, use } from 'react';

import { type IOperation, type IOperationSchema, type IOssItem } from '../../models/oss';

export const OssTabID = {
  CARD: 0,
  GRAPH: 1
} as const;
export type OssTabID = (typeof OssTabID)[keyof typeof OssTabID];

interface IOssEditContext {
  schema: IOperationSchema;
  selected: string[];
  selectedItems: IOssItem[];

  isOwned: boolean;
  isMutable: boolean;

  navigateTab: (tab: OssTabID) => void;
  navigateOperationSchema: (target: number) => void;

  canDeleteOperation: (target: IOperation) => boolean;
  deleteSchema: () => void;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const OssEditContext = createContext<IOssEditContext | null>(null);
export const useOssEdit = () => {
  const context = use(OssEditContext);
  if (context === null) {
    throw new Error('useOssEdit has to be used within <OssEditState>');
  }
  return context;
};
