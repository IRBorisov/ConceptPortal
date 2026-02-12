'use client';

import { createContext, use } from 'react';

import { type ArgumentValue, type Constituenta } from '../../models/rsform';

interface ITemplateContext {
  args: ArgumentValue[];
  prototype: Constituenta | null;
  templateID: number | null;
  filterCategory: Constituenta | null;

  onChangeArguments: (newArgs: ArgumentValue[]) => void;
  onChangePrototype: (newPrototype: Constituenta) => void;
  onChangeTemplateID: (newTemplateID: number | null) => void;
  onChangeFilterCategory: (newFilterCategory: Constituenta | null) => void;
}

export const TemplateContext = createContext<ITemplateContext | null>(null);
export const useTemplateContext = () => {
  const context = use(TemplateContext);
  if (context === null) {
    throw new Error('useTemplateContext has to be used within <TemplateState>');
  }
  return context;
};
