'use client';

import { createContext, use } from 'react';

import { type RSEngine, type RSForm, type RSModel } from '@/domain/library';

interface IRSModelContext {
  model: RSModel;
  engine: RSEngine;
  schema: RSForm;
  isMutable: boolean;
  isOwned: boolean;

  deleteModel: () => void;
}

export const RSModelContext = createContext<IRSModelContext | null>(null);
export const useRSModelEdit = () => {
  const context = use(RSModelContext);
  if (context === null) {
    throw new Error('useRSModel has to be used within <RSModelState>');
  }
  return context;
};
