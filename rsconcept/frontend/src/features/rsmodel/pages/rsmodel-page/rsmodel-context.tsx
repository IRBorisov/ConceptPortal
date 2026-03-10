'use client';

import { createContext, use } from 'react';

import { type CalculatorResult, type Value } from '@/features/rslang';

import { type BasicBinding, type EvalStatus, type RSModel } from '../../models/rsmodel';

interface IRSModelContext {
  model: RSModel;
  isMutable: boolean;
  isOwned: boolean;

  setValue: (cstID: number, data: Value) => void;
  setBasicValue: (cstID: number, data: BasicBinding) => void;
  resetValue: (cstID: number) => void;
  calculateCst: (cstID: number) => CalculatorResult;
  getEvalStatus: (cstID: number) => EvalStatus;
  getCstValue: (cstID: number) => Value | null;

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
