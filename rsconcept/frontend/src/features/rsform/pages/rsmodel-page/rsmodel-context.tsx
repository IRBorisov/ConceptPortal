'use client';

import { createContext, use } from 'react';

import { type RO } from '@/utils/meta';

import { type RSModelDTO } from '../../backend/types';

interface IRSModelContext {
  model: RO<RSModelDTO>;
}

export const RSModelContext = createContext<IRSModelContext | null>(null);
export const useRSModel = () => {
  const context = use(RSModelContext);
  if (context === null) {
    throw new Error('useRSModel has to be used within <RSModelState>');
  }
  return context;
};
