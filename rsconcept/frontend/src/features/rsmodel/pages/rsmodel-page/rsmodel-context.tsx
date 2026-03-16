'use client';

import { createContext, use } from 'react';

import { type RSForm } from '@/features/rsform';

import { type RO } from '@/utils/meta';

import { type RSModelDTO } from '../../backend/types';
import { type RSEngine } from '../../models/rsengine';

interface IRSModelContext {
  model: RO<RSModelDTO>;
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
