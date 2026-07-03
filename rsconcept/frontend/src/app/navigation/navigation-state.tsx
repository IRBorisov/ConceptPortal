'use client';

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { type LibraryItemType } from '@rsconcept/domain/library';

import { absorbViewTransitionAbort, isViewTransitionAbortError } from '@/app/navigation/view-transition-error';

import { useTooltipsStore } from '@/stores/tooltips';

import { type UnsavedSaveHandler, useUnsavedChanges } from '../changes/use-unsaved-changes';
import { urls } from '../urls';

import { NavigationContext, type NavigationProps, PromptTabID, RSModelTabID, RSTabID } from './navigation-context';

interface RouterCallOptions {
  replace?: boolean;
  viewTransition?: boolean;
}

export const NavigationState = ({ children }: React.PropsWithChildren) => {
  const router = useNavigate();
  const { promptUnsaved } = useUnsavedChanges();

  const saveHandler = useRef<{ id: symbol; handler: UnsavedSaveHandler } | null>(null);
  const [internalNavigation, setInternalNavigation] = useState(false);
  const enableTooltips = useTooltipsStore(state => state.showTooltips);

  function callRouter(to: string | number, options?: RouterCallOptions): void | Promise<void> {
    if (typeof to === 'number') {
      return router(to);
    }
    const result = options?.viewTransition
      ? router(to, { replace: options.replace, viewTransition: true })
      : router(to, options?.replace ? { replace: true } : undefined);
    return options?.viewTransition ? absorbViewTransitionAbort(result) : result;
  }

  function runConfirmedNavigation(action: () => void | Promise<void>): Promise<void> {
    return (async () => {
      try {
        await action();
        enableTooltips();
      } catch (error) {
        if (!isViewTransitionAbortError(error)) {
          console.error(error);
        }
      }
    })();
  }

  function requestNavigation(action: () => void | Promise<void>, force?: boolean): void {
    const onSave = saveHandler.current?.handler;
    if (force || !onSave) {
      void runConfirmedNavigation(action);
      return;
    }
    void promptUnsaved({
      onSave,
      onConfirm: () => runConfirmedNavigation(action)
    });
  }

  function registerUnsavedSaveHandler(handler: UnsavedSaveHandler): () => void {
    const id = Symbol('navigation-unsaved-save-handler');
    saveHandler.current = { id, handler };
    return () => {
      if (saveHandler.current?.id !== id) {
        return;
      }
      saveHandler.current = null;
    };
  }

  function canBack(): boolean {
    return internalNavigation && !!window.history && window.history?.length !== 0;
  }

  function pushInPlace(path: string, force?: boolean): void {
    requestNavigation(() => {
      setInternalNavigation(true);
      return callRouter(path);
    }, force);
  }

  function push(props: NavigationProps): void {
    if (props.newTab) {
      window.open(props.path, '_blank', 'noopener,noreferrer');
    } else {
      requestNavigation(() => {
        setInternalNavigation(true);
        return callRouter(props.path, { viewTransition: true });
      }, props.force);
    }
  }

  function pushAsync(props: NavigationProps): void | Promise<void> {
    const onSave = saveHandler.current?.handler;
    if (props.newTab) {
      window.open(props.path, '_blank', 'noopener,noreferrer');
    } else if (props.force || !onSave) {
      setInternalNavigation(true);
      enableTooltips();
      return callRouter(props.path, { viewTransition: true });
    } else {
      return promptUnsaved({
        onSave,
        onConfirm: () =>
          runConfirmedNavigation(() => {
            setInternalNavigation(true);
            enableTooltips();
            return callRouter(props.path, { viewTransition: true });
          })
      }).then(() => undefined);
    }
  }

  function replace(props: Omit<NavigationProps, 'newTab'>): void {
    requestNavigation(() => callRouter(props.path, { replace: true, viewTransition: true }), props.force);
  }

  function replaceAsync(props: Omit<NavigationProps, 'newTab'>): void | Promise<void> {
    const onSave = saveHandler.current?.handler;
    if (props.force || !onSave) {
      enableTooltips();
      return callRouter(props.path, { replace: true, viewTransition: true });
    } else {
      void promptUnsaved({
        onSave,
        onConfirm: () => runConfirmedNavigation(() => callRouter(props.path, { replace: true, viewTransition: true }))
      });
    }
  }

  function back(force?: boolean): void {
    requestNavigation(() => callRouter(-1), force);
  }

  function forward(force?: boolean): void {
    requestNavigation(() => callRouter(1), force);
  }

  function changeTab(tabID: number): void {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('tab');
    if (currentTab === String(tabID)) {
      return;
    }
    url.searchParams.set('tab', String(tabID));
    pushInPlace(url.pathname + url.search + url.hash);
  }

  function changeActive(activeID: number): void {
    const url = new URL(window.location.href);
    const currentActive = url.searchParams.get('active');
    if (currentActive === String(activeID)) {
      return;
    }
    url.searchParams.set('active', String(activeID));
    pushInPlace(url.pathname + url.search + url.hash);
  }

  function clearActive(): void {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('active')) {
      return;
    }
    url.searchParams.delete('active');
    replace({ path: url.pathname + url.search + url.hash });
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

        changeTab,
        changeActive,
        clearActive,

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
        gotoSandboxEditor,
        registerUnsavedSaveHandler
      }}
    >
      {children}
    </NavigationContext>
  );
};
