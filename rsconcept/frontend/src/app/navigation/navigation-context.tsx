import { createContext, use, useEffect, useEffectEvent } from 'react';

import { type LibraryItemType } from '@rsconcept/domain/library';

import { type UnsavedSaveHandler } from '../changes/use-unsaved-changes';

/** Navigation props. */
export interface NavigationProps {
  path: string;
  newTab?: boolean;
  force?: boolean;
}

/** RSForm Tabs IDs. */
export const RSTabID = {
  CARD: 0,
  CST_LIST: 1,
  CST_EDIT: 2,
  GRAPH: 3
} as const;
export type RSTabID = (typeof RSTabID)[keyof typeof RSTabID];

/** RSModel Tabs IDs. */
export const RSModelTabID = {
  CARD: 0,
  CST_LIST: 1,
  CST_EDIT: 2,
  GRAPH: 3,
  VALUE_EDIT: 4,
  EVALUATOR: 5
} as const;
export type RSModelTabID = (typeof RSModelTabID)[keyof typeof RSModelTabID];

/** OSS Tabs IDs. */
export const OssTabID = {
  CARD: 0,
  GRAPH: 1
} as const;
export type OssTabID = (typeof OssTabID)[keyof typeof OssTabID];

/** Prompt Tabs IDs. */
export const PromptTabID = {
  LIST: 0,
  EDIT: 1,
  VARIABLES: 2
} as const;
export type PromptTabID = (typeof PromptTabID)[keyof typeof PromptTabID];

interface INavigationContext {
  push: (props: NavigationProps) => void;
  pushAsync: (props: NavigationProps) => void | Promise<void>;
  replace: (props: Omit<NavigationProps, 'newTab'>) => void;
  replaceAsync: (props: Omit<NavigationProps, 'newTab'>) => void | Promise<void>;
  back: (force?: boolean) => void;
  forward: (force?: boolean) => void;

  /** Check if can go back in history. */
  canBack: () => boolean;

  /** Change current tab. */
  changeTab: (tabID: number) => void;

  /** Change active id. */
  changeActive: (activeID: number) => void;

  /** Navigate to Sandbox Editor. */
  gotoSandboxEditor: (newTab?: boolean) => void;

  /** Navigate to edit active id. */
  gotoEditActive: (activeID: number, newTab?: boolean) => void;

  /** Navigate to value of active id. */
  gotoActiveValue: (activeID: number, newTab?: boolean) => void;

  /** Navigate to Library. */
  gotoLibrary: (newTab?: boolean) => void;

  /** Navigate to New Item. */
  gotoNewItem: (itemType?: LibraryItemType, newTab?: boolean) => void;

  /** Navigate to New Model. */
  gotoNewModel: (schemaID: number, newTab?: boolean) => void;

  /** Navigate to RSForm. */
  gotoRSForm: (
    schemaID: number,
    version?: string | number,
    newTab?: boolean,
    preserveQuery?: { tab?: number; active?: number }
  ) => void;

  /** Navigate to RSModel. */
  gotoRSModel: (modelID: number, newTab?: boolean, preserveQuery?: { tab?: number; active?: number }) => void;

  /** Navigate to OSS. */
  gotoOss: (ossID: number, newTab?: boolean) => void;

  /** Navigate to Constituenta Edit. */
  gotoCstEdit: (schemaID: number, cstID: number, newTab?: boolean) => void;

  /** Navigate to Constituents List. */
  gotoCstList: (schemaID: number, newTab?: boolean) => void;

  /** Navigate to Term Graph. */
  gotoTermGraph: (schemaID: number, newTab?: boolean) => void;

  /** Navigate to Edit Prompt. */
  gotoPromptEdit: (promptID: number, newTab?: boolean) => void;

  /** Navigate to Prompt List. */
  gotoPromptList: (promptID: number | null, newTab?: boolean) => void;

  /** Register pending changes save handler used before in-app navigation. */
  registerUnsavedSaveHandler: (handler: UnsavedSaveHandler) => () => void;
}

export const NavigationContext = createContext<INavigationContext | null>(null);

export const useConceptNavigation = () => {
  const context = use(NavigationContext);
  if (!context) {
    throw new Error('useConceptNavigation has to be used within <NavigationState>');
  }
  return context;
};

export function useRegisterUnsavedSave(savePendingChanges: UnsavedSaveHandler, isActive = true) {
  const { registerUnsavedSaveHandler } = useConceptNavigation();
  const onRegister = useEffectEvent(registerUnsavedSaveHandler);
  const onSave = useEffectEvent(savePendingChanges);

  useEffect(
    function registerUnsavedSaveEffect() {
      if (!isActive) {
        return;
      }
      return onRegister(onSave);
    },
    [isActive]
  );
}
