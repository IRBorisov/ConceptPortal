'use client';

import { createContext, use, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useTooltipsStore } from '@/stores/tooltips';

import { urls } from '../urls';

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
  DATA: 4
} as const;
export type RSModelTabID = (typeof RSModelTabID)[keyof typeof RSModelTabID];

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

  /** Navigate to edit active id. */
  gotoEditActive: (activeID: number, newTab?: boolean) => void;

  /** Navigate to Library. */
  gotoLibrary: (newTab?: boolean) => void;

  /** Navigate to New Item. */
  gotoNewItem: (newTab?: boolean) => void;

  /** Navigate to RSForm. */
  gotoRSForm: (schemaID: number, version?: string | number, newTab?: boolean) => void;

  /** Navigate to RSModel. */
  gotoRSModel: (modelID: number, newTab?: boolean) => void;

  /** Navigate to OSS. */
  gotoOss: (ossID: number, newTab?: boolean) => void;

  /** Navigate to Constituenta Edit. */
  gotoCstEdit: (schemaID: number, cstID: number, newTab?: boolean) => void;

  /** Navigate to Constituents List. */
  gotoCstList: (schemaID: number, newTab?: boolean) => void;

  /** Navigate to Term Graph. */
  gotoTermGraph: (schemaID: number, newTab?: boolean) => void;

  /** Set require confirmation flag before navigating. */
  setRequireConfirmation: (value: boolean) => void;

  /** Navigate to Edit Prompt. */
  gotoPromptEdit: (promptID: number, newTab?: boolean) => void;

  /** Navigate to Prompt List. */
  gotoPromptList: (promptID: number | null, newTab?: boolean) => void;
}

const NavigationContext = createContext<INavigationContext | null>(null);
export const useConceptNavigation = () => {
  const context = use(NavigationContext);
  if (!context) {
    throw new Error('useConceptNavigation has to be used within <NavigationState>');
  }
  return context;
};

export const NavigationState = ({ children }: React.PropsWithChildren) => {
  const router = useNavigate();

  const isBlocked = useRef(false);
  const [internalNavigation, setInternalNavigation] = useState(false);
  const enableTooltips = useTooltipsStore(state => state.showTooltips);

  function validate(): boolean {
    return !isBlocked.current || confirm('Изменения не сохранены. Вы уверены что хотите совершить переход?');
  }

  function canBack(): boolean {
    return internalNavigation && !!window.history && window.history?.length !== 0;
  }

  function push(props: NavigationProps): void {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      isBlocked.current = false;
      setInternalNavigation(true);
      Promise.resolve(router(props.path, { viewTransition: true }))
        .then(enableTooltips)
        .catch(console.error);
    }
  }

  function pushAsync(props: NavigationProps): void | Promise<void> {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      isBlocked.current = false;
      setInternalNavigation(true);
      enableTooltips();
      return router(props.path, { viewTransition: true });
    }
  }

  function replace(props: Omit<NavigationProps, 'newTab'>): void {
    if (props.force || validate()) {
      isBlocked.current = false;
      Promise.resolve(router(props.path, { replace: true, viewTransition: true }))
        .then(enableTooltips)
        .catch(console.error);
    }
  }

  function replaceAsync(props: Omit<NavigationProps, 'newTab'>): void | Promise<void> {
    if (props.force || validate()) {
      isBlocked.current = false;
      enableTooltips();
      return router(props.path, { replace: true, viewTransition: true });
    }
  }

  function back(force?: boolean): void {
    if (force || validate()) {
      Promise.resolve(router(-1)).then(enableTooltips).catch(console.error);
      isBlocked.current = false;
    }
  }

  function forward(force?: boolean): void {
    if (force || validate()) {
      Promise.resolve(router(1)).then(enableTooltips).catch(console.error);
      isBlocked.current = false;
    }
  }

  function changeTab(tabID: number): void {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('tab');
    if (currentTab === String(tabID)) {
      return;
    }
    url.searchParams.set('tab', String(tabID));
    push({ path: url.pathname + url.search + url.hash });
  };

  function changeActive(activeID: number): void {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('active');
    if (currentTab === String(activeID)) {
      return;
    }
    url.searchParams.set('active', String(activeID));
    push({ path: url.pathname + url.search + url.hash });
  };

  function gotoEditActive(activeID: number, newTab?: boolean): void {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', String(RSTabID.CST_EDIT));
    url.searchParams.set('active', String(activeID));
    push({ path: url.pathname + url.search + url.hash, newTab: newTab });
  }

  function gotoNewItem(newTab?: boolean): void {
    push({ path: urls.create_schema, newTab: newTab });
  }

  function gotoLibrary(newTab?: boolean): void {
    push({ path: urls.library, newTab: newTab });
  }

  function gotoRSForm(schemaID: number, version?: string | number, newTab?: boolean): void {
    push({ path: urls.schema(schemaID, version), newTab: newTab });
  }

  function gotoRSModel(modelID: number, newTab?: boolean): void {
    push({ path: urls.model(modelID), newTab: newTab });
  }

  function gotoOss(ossID: number, newTab?: boolean): void {
    push({ path: urls.oss(ossID), newTab: newTab });
  }

  function gotoCstList(schemaID: number, newTab?: boolean): void {
    push({ path: urls.schema_props({ id: schemaID, tab: RSTabID.CST_LIST }), newTab: newTab });
  }

  function gotoTermGraph(schemaID: number, newTab?: boolean): void {
    push({ path: urls.schema_props({ id: schemaID, tab: RSTabID.GRAPH }), newTab: newTab });
  }

  function gotoCstEdit(schemaID: number, cstID: number, newTab?: boolean): void {
    push({
      path: urls.schema_props({
        id: schemaID,
        active: cstID,
        tab: RSTabID.CST_EDIT
      }),
      newTab: newTab
    });
  }

  function gotoPromptEdit(promptID: number, newTab?: boolean): void {
    push({ path: urls.prompt_template(promptID, PromptTabID.EDIT), newTab: newTab });
  }

  function gotoPromptList(promptID: number | null, newTab?: boolean): void {
    push({ path: urls.prompt_template(promptID, PromptTabID.LIST), newTab: newTab });
  }

  return (
    <NavigationContext
      value={{
        push,
        pushAsync,
        replace,
        replaceAsync,
        back,
        forward,
        canBack,
        setRequireConfirmation: (value: boolean) => (isBlocked.current = value),

        changeTab,
        changeActive,

        gotoLibrary,
        gotoNewItem,

        gotoEditActive,
        gotoRSForm,
        gotoRSModel,
        gotoOss,
        gotoCstEdit,
        gotoCstList,
        gotoTermGraph,
        gotoPromptEdit,
        gotoPromptList
      }}
    >
      {children}
    </NavigationContext>
  );
};

export function useBlockNavigation(isBlocked: boolean) {
  const { setRequireConfirmation } = useConceptNavigation();
  useEffect(() => {
    setRequireConfirmation(isBlocked);
    return () => setRequireConfirmation(false);
  }, [setRequireConfirmation, isBlocked]);
}