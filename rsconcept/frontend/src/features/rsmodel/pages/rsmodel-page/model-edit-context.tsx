'use client';

import { createContext, use } from 'react';

import { type RSEngine, type RSForm, type RSModel } from '@/domain/library';

interface IModelEditContext {
  model: RSModel;
  engine: RSEngine;
  schema: RSForm;
  isMutable: boolean;
  isOwned: boolean;

  deleteModel: () => void;
}

export const ModelEditContext = createContext<IModelEditContext | null>(null);
export const useModelEdit = () => {
  const context = use(ModelEditContext);
  if (context === null) {
    throw new Error('useModelEdit has to be used within <ModelEditState>');
  }
  return context;
};
