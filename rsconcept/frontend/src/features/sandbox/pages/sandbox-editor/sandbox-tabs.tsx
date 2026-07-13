'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { useTx } from '@/i18n';
import { isSchemaIssue } from '@rsconcept/domain/library/rsform-api';
import { getEvalIssueItems } from '@rsconcept/domain/library/rsmodel-api';

import { RSModelTabID, useConceptNavigation } from '@/app/navigation/navigation-context';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { TabConstituenta } from '@/features/rsform/pages/rsform-page/tab-constituenta';
import { TabSchemaGraph } from '@/features/rsform/pages/rsform-page/tab-schema-graph';
import { useCstSearchStore } from '@/features/rsform/stores/cst-search';
import { useModelEdit } from '@/features/rsmodel/pages/rsmodel-page/model-edit-context';
import { TabEvaluator } from '@/features/rsmodel/pages/rsmodel-page/tab-evaluator';
import { TabModelList } from '@/features/rsmodel/pages/rsmodel-page/tab-model-list';
import { TabValue } from '@/features/rsmodel/pages/rsmodel-page/tab-value';

import { IconStatusError, IconStatusIncalculable } from '@/components/icons';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { IndicatorPill } from '@/components/view/indicator-pill';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { MenuEdit } from './menu-edit';
import { MenuMain } from './menu-main';
import { TabItemCard } from './tab-item-card';

interface SandboxTabsProps {
  activeID?: number;
  activeTab: RSModelTabID;
}

export function SandboxTabs({ activeID, activeTab }: SandboxTabsProps) {
  const tx = useTx();
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const onHideFooterEvent = useEffectEvent(hideFooter);

  const focusSchemaIssues = useCstSearchStore(state => state.focusSchemaIssues);
  const focusModelIssues = useCstSearchStore(state => state.focusModelIssues);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { schema, selectedCst, setSelectedCst, setSelectedEdges, deselectAll, pendingActiveID, clearPendingActiveID } =
    useSchemaEdit();

  const { engine } = useModelEdit();
  useSyncExternalStore(
    onStoreChange => engine.subscribeChanges(onStoreChange),
    () => engine.getChangeGeneration()
  );

  const problemItems = schema.items.filter(cst => isSchemaIssue(cst));
  const countProblematic = problemItems.length;

  const modelIssues = getEvalIssueItems(schema.items, engine);
  const countModelIssues = modelIssues.length;

  useLayoutEffect(
    function updateWindowTitle() {
      const oldTitle = document.title;
      document.title = `${tx('tx.sandbox')} — ${schema.title}`;
      return function restoreWindowTitle() {
        document.title = oldTitle;
      };
    },
    [schema.title, tx]
  );

  useLayoutEffect(
    function hideFooterOnForSomeTabs() {
      const nextNoFooter = activeTab !== RSModelTabID.CARD;
      onHideFooterEvent(nextNoFooter);
    },
    [activeTab]
  );

  useEffect(function restoreFooterOnUnmount() {
    return function restoreFooter() {
      onHideFooterEvent(false);
    };
  }, []);

  useLayoutEffect(
    function syncNavigationAndSelection() {
      if (
        activeTab === RSModelTabID.CST_EDIT ||
        activeTab === RSModelTabID.VALUE_EDIT ||
        activeTab === RSModelTabID.EVALUATOR
      ) {
        if (pendingActiveID !== null && activeID !== pendingActiveID) {
          return;
        }
        if (pendingActiveID !== null && activeID === pendingActiveID) {
          clearPendingActiveID();
        }

        let nextSelected: number[] = [];
        const hasActiveID = activeID !== undefined;

        if (hasActiveID && schema.cstByID.has(activeID)) {
          nextSelected = [activeID];
        } else if (hasActiveID && selectedCst.length === 0 && schema.items.length > 0) {
          nextSelected = [schema.items[0].id];
        } else if (!hasActiveID && schema.items.length > 0) {
          nextSelected = [schema.items[0].id];
        } else if (hasActiveID) {
          return;
        }

        const isSameSelection =
          nextSelected.length === selectedCst.length &&
          nextSelected.every((value, index) => value === selectedCst[index]);

        if (!isSameSelection) {
          if (nextSelected.length === 0) {
            if (selectedCst.length !== 0) {
              deselectAll();
            }
          } else {
            setSelectedCst(nextSelected);
          }
        }
      }
    },
    [activeTab, activeID, selectedCst, schema, setSelectedCst, deselectAll, pendingActiveID, clearPendingActiveID]
  );

  function onSelectTab(index: number, last: number, event: Event) {
    if (last === index) {
      return;
    }
    setIsModified(false);
    setSelectedEdges([]);
    if (event.type == 'keydown') {
      const kbEvent = event as KeyboardEvent;
      if (kbEvent.altKey) {
        if (kbEvent.code === 'ArrowLeft') {
          router.back();
          return;
        } else if (kbEvent.code === 'ArrowRight') {
          router.forward();
          return;
        }
      }
    }
    router.changeTab(index);
  }

  function onFocusSchemaIssues(event: React.MouseEvent<HTMLDivElement>) {
    focusSchemaIssues();
    if (event.ctrlKey || event.metaKey) {
      setSelectedCst(problemItems.map(cst => cst.id));
    } else {
      router.gotoEditActive(problemItems[0].id);
    }
  }

  function onFocusModelIssues(event: React.MouseEvent<HTMLDivElement>) {
    focusModelIssues();
    if (modelIssues.length === 0) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      setSelectedCst(modelIssues.map(cst => cst.id));
    } else {
      clearPendingActiveID();
      router.gotoActiveValue(modelIssues[0].id);
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  useResetAttribute(containerRef, 'data-tooltip-id');

  return (
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus
      className='relative flex flex-col min-w-fit items-center'
    >
      <TabList className='absolute z-sticky flex border-b-2 border-x-2 divide-x-2 bg-background'>
        {countProblematic > 0 ? (
          <IndicatorPill
            className='absolute top-1.5 -left-1.5 -translate-x-full hidden xs:inline-flex'
            icon={<IconStatusError size='0.8rem' />}
            value={countProblematic}
            color='destructive'
            title={tx('tx.schema.issue.plural')}
            onClick={onFocusSchemaIssues}
          />
        ) : null}
        {countModelIssues > 0 ? (
          <IndicatorPill
            className='absolute top-1.5 -right-1.5 translate-x-full hidden xs:inline-flex'
            icon={<IconStatusIncalculable size='0.8rem' />}
            value={countModelIssues}
            color='orange'
            title={tx('tx.model.issue.plural')}
            onClick={onFocusModelIssues}
          />
        ) : null}

        <div className='flex border-r-2'>
          <MenuMain />
          <MenuEdit />
        </div>

        <TabLabel label={tx('tx.lib.item.passport')} data-tour='tab-passport' />
        <TabLabel label={tx('tx.list')} data-tour='tab-list' />
        <TabLabel label={tx('tx.concept')} data-tour='tab-concept' />
        <TabLabel label={tx('tx.graph')} data-tour='tab-graph' />
        <TabLabel label={tx('tx.general.data')} data-tour='tab-data' />
        <TabLabel label={tx('tx.general.evaluation')} data-tour='tab-evaluation' />
      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <TabItemCard />
        </TabPanel>

        <TabPanel>
          <TabModelList />
        </TabPanel>

        <TabPanel>
          <TabConstituenta />
        </TabPanel>

        <TabPanel>
          <TabSchemaGraph />
        </TabPanel>

        <TabPanel>
          <TabValue />
        </TabPanel>

        <TabPanel>
          <TabEvaluator />
        </TabPanel>
      </div>
    </Tabs>
  );
}
