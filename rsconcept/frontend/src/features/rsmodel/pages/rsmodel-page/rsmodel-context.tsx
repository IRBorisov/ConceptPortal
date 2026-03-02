'use client';

import { createContext, use } from 'react';

import { type RSModel } from '../../models/rsmodel';

interface IRSModelContext {
  model: RSModel;
  isMutable: boolean;
  isOwned: boolean;

  deleteModel: () => void;
  recalculateAll: () => void;
}

export const RSModelContext = createContext<IRSModelContext | null>(null);
export const useRSModelEdit = () => {
  const context = use(RSModelContext);
  if (context === null) {
    throw new Error('useRSModel has to be used within <RSModelState>');
  }
  return context;
};
