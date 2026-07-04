'use client';

import { createContext, use } from 'react';

import { type ArgumentValue, type Constituenta } from '@rsconcept/domain/library';

export interface TemplateSelection {
  prototype: Constituenta | null;
  args: ArgumentValue[];
  templateItems: Constituenta[];
}

interface ITemplateContext {
  args: ArgumentValue[];
  prototype: Constituenta | null;
  templateID: number | null;
  templateItems: Constituenta[];
  filterCategory: Constituenta | null;

  onChangeArguments: (newArgs: ArgumentValue[]) => void;
  onChangePrototype: (newPrototype: Constituenta) => void;
  onChangeTemplateID: (newTemplateID: number | null) => void;
  onChangeTemplateItems: (items: Constituenta[]) => void;
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
