'use client';

import { createContext, use, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { type LibraryItemType } from '@/domain/library';

import { useTooltipsStore } from '@/stores/tooltips';

import { urls } from '../urls';

import { DlgUnsavedNavigation } from './dlg-unsaved-navigation';

export interface NavigationProps {
  path: string;
  newTab?: boolean;
  force?: boolean;
}

type NavigationSaveHandler = () => void | Promise<void>;

interface PendingNavigation {
  action: () => void | Promise<void>;
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

  /** Register a handler that saves current unsaved edits before navigating. */
  registerNavigationSaveHandler: (handler: NavigationSaveHandler) => () => void;

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

  const saveHandler = useRef<{ id: symbol; handler: NavigationSaveHandler } | null>(null);
  const [hasSaveHandler, setHasSaveHandler] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);
  const [isSavingBeforeNavigation, setIsSavingBeforeNavigation] = useState(false);
  const [internalNavigation, setInternalNavigation] = useState(false);
  const enableTooltips = useTooltipsStore(state => state.showTooltips);

  function runConfirmedNavigation(action: () => void | Promise<void>): void {
    Promise.resolve(action()).then(enableTooltips).catch(console.error);
  }

  function requestNavigation(action: () => void | Promise<void>, force?: boolean): void {
    if (force || !saveHandler.current) {
      runConfirmedNavigation(action);
      return;
    }
    setPendingNavigation({ action });
  }

  function handleCancelNavigation(): void {
    if (isSavingBeforeNavigation) {
      return;
    }
    setPendingNavigation(null);
  }

  function handleContinueWithoutSaving(): void {
    const nextNavigation = pendingNavigation;
    if (!nextNavigation) {
      return;
    }
    setPendingNavigation(null);
    runConfirmedNavigation(nextNavigation.action);
  }

  async function handleSaveAndContinue(): Promise<void> {
    const nextNavigation = pendingNavigation;
    const onSave = saveHandler.current?.handler;
    if (!nextNavigation || !onSave) {
      return;
    }
    setIsSavingBeforeNavigation(true);
    try {
      await onSave();
      setPendingNavigation(null);
      runConfirmedNavigation(nextNavigation.action);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingBeforeNavigation(false);
    }
  }

  function canBack(): boolean {
    return internalNavigation && !!window.history && window.history?.length !== 0;
  }

  function push(props: NavigationProps): void {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else {
      requestNavigation(() => {
        setInternalNavigation(true);
        return router(props.path, { viewTransition: true });
      }, props.force);
    }
  }

  function pushAsync(props: NavigationProps): void | Promise<void> {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || !saveHandler.current) {
      setInternalNavigation(true);
      enableTooltips();
      return router(props.path, { viewTransition: true });
    } else {
      setPendingNavigation({
        action: () => {
          setInternalNavigation(true);
          return router(props.path, { viewTransition: true });
        }
      });
    }
  }

  function replace(props: Omit<NavigationProps, 'newTab'>): void {
    requestNavigation(() => router(props.path, { replace: true, viewTransition: true }), props.force);
  }

  function replaceAsync(props: Omit<NavigationProps, 'newTab'>): void | Promise<void> {
    if (props.force || !saveHandler.current) {
      enableTooltips();
      return router(props.path, { replace: true, viewTransition: true });
    } else {
      setPendingNavigation({
        action: () => router(props.path, { replace: true, viewTransition: true })
      });
    }
  }

  function back(force?: boolean): void {
    requestNavigation(() => router(-1), force);
  }

  function forward(force?: boolean): void {
    requestNavigation(() => router(1), force);
  }

  function changeTab(tabID: number): void {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('tab');
    if (currentTab === String(tabID)) {
      return;
    }
    url.searchParams.set('tab', String(tabID));
    push({ path: url.pathname + url.search + url.hash });
  }

  function changeActive(activeID: number): void {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('active');
    if (currentTab === String(activeID)) {
      return;
    }
    url.searchParams.set('active', String(activeID));
    push({ path: url.pathname + url.search + url.hash });
  }

  function gotoEditActive(activeID: number, newTab?: boolean): void {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', String(RSTabID.CST_EDIT));
    url.searchParams.set('active', String(activeID));
    push({ path: url.pathname + url.search + url.hash, newTab: newTab });
  }

  function gotoActiveValue(activeID: number, newTab?: boolean): void {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', String(RSModelTabID.VALUE_EDIT));
    url.searchParams.set('active', String(activeID));
    push({ path: url.pathname + url.search + url.hash, newTab: newTab });
  }

  function gotoSandboxEditor(newTab?: boolean): void {
    push({ path: urls.sandbox, newTab: newTab });
  }

  function gotoNewItem(itemType?: LibraryItemType, newTab?: boolean): void {
    push({
      path: itemType ? urls.create_item_by_type(itemType) : urls.create_item,
      newTab: newTab
    });
  }

  function gotoNewModel(schemaID: number, newTab?: boolean): void {
    push({ path: urls.create_model(schemaID), newTab: newTab });
  }

  function gotoLibrary(newTab?: boolean): void {
    push({ path: urls.library, newTab: newTab });
  }

  function gotoRSForm(
    schemaID: number,
    version?: string | number,
    newTab?: boolean,
    preserveQuery?: { tab?: number; active?: number }
  ): void {
    const basePath = urls.schema(schemaID, version);
    if (!preserveQuery || (preserveQuery.tab === undefined && preserveQuery.active === undefined)) {
      push({ path: basePath, newTab: newTab });
      return;
    }
    const url = new URL(basePath, window.location.origin);
    if (preserveQuery.tab !== undefined) {
      url.searchParams.set('tab', String(preserveQuery.tab));
    }
    if (preserveQuery.active !== undefined) {
      url.searchParams.set('active', String(preserveQuery.active));
    }
    push({ path: url.pathname + url.search + url.hash, newTab: newTab });
  }

  function gotoRSModel(modelID: number, newTab?: boolean, preserveQuery?: { tab?: number; active?: number }): void {
    if (!preserveQuery || (preserveQuery.tab === undefined && preserveQuery.active === undefined)) {
      push({ path: urls.model(modelID), newTab: newTab });
      return;
    }
    const tab = preserveQuery.tab ?? RSModelTabID.CARD;
    const path = urls.model_props({
      id: modelID,
      tab,
      active: preserveQuery.active
    });
    push({ path, newTab: newTab });
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

  function registerNavigationSaveHandler(handler: NavigationSaveHandler): () => void {
    const id = Symbol('navigation-save-handler');
    saveHandler.current = { id, handler };
    setHasSaveHandler(true);
    return () => {
      if (saveHandler.current?.id !== id) {
        return;
      }
      saveHandler.current = null;
      setHasSaveHandler(false);
    };
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
        registerNavigationSaveHandler,

        changeTab,
        changeActive,

        gotoLibrary,
        gotoNewItem,
        gotoNewModel,

        gotoEditActive,
        gotoActiveValue,
        gotoRSForm,
        gotoRSModel,
        gotoOss,
        gotoCstEdit,
        gotoCstList,
        gotoTermGraph,
        gotoPromptEdit,
        gotoPromptList,
        gotoSandboxEditor
      }}
    >
      {children}
      <DlgUnsavedNavigation
        open={!!pendingNavigation}
        canSave={hasSaveHandler}
        isSaving={isSavingBeforeNavigation}
        onCancel={handleCancelNavigation}
        onContinue={handleContinueWithoutSaving}
        onSaveAndContinue={() => void handleSaveAndContinue()}
      />
    </NavigationContext>
  );
};

export function useRegisterNavigationSave(savePendingChanges: NavigationSaveHandler, isActive = true) {
  const { registerNavigationSaveHandler } = useConceptNavigation();
  const onRegisterNavigationSaveHandler = useEffectEvent(registerNavigationSaveHandler);
  const onSavePendingChanges = useEffectEvent(savePendingChanges);

  useEffect(
    function registerNavigationSaveEffect() {
      if (!isActive) {
        return;
      }
      return onRegisterNavigationSaveHandler(onSavePendingChanges);
    },
    [isActive]
  );
}
