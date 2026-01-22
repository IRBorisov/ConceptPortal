'use client';

import { createContext, use } from 'react';

import { type IArgumentValue } from '@/features/rslang/types';

import { type IConstituenta } from '../../models/rsform';

interface ITemplateContext {
  args: IArgumentValue[];
  prototype: IConstituenta | null;
  templateID: number | null;
  filterCategory: IConstituenta | null;

  onChangeArguments: (newArgs: IArgumentValue[]) => void;
  onChangePrototype: (newPrototype: IConstituenta) => void;
  onChangeTemplateID: (newTemplateID: number | null) => void;
  onChangeFilterCategory: (newFilterCategory: IConstituenta | null) => void;
}

export const TemplateContext = createContext<ITemplateContext | null>(null);
export const useTemplateContext = () => {
  const context = use(TemplateContext);
  if (context === null) {
    throw new Error('useTemplateContext has to be used within <TemplateState>');
  }
  return context;
};
