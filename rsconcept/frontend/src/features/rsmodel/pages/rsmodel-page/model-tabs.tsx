'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';

import { isProblematic } from '@/domain/library/rsform-api';

import { RSModelTabID, useConceptNavigation } from '@/app/navigation/navigation-context';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { TabConstituenta } from '@/features/rsform/pages/rsform-page/tab-constituenta';
import { TabSchemaGraph } from '@/features/rsform/pages/rsform-page/tab-schema-graph';
import { useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { IconStatusError } from '@/components/icons';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { IndicatorPill } from '@/components/view/indicator-pill';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { MenuModel } from './menu-model';
import { useModelEdit } from './model-edit-context';
import { TabEvaluator } from './tab-evaluator';
import { TabModelCard } from './tab-model-card';
import { TabModelList } from './tab-model-list';
import { TabValue } from './tab-value';

interface ModelTabsProps {
  activeID?: number;
  activeTab: RSModelTabID;
}

export function ModelTabs({ activeID, activeTab }: ModelTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const onHideFooterEvent = useEffectEvent(hideFooter);
  const focusProblematic = useCstSearchStore(state => state.focusProblematic);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { schema, selectedCst, setSelectedCst, setSelectedEdges, deselectAll, pendingActiveID, clearPendingActiveID } =
    useSchemaEdit();
  const { model } = useModelEdit();

  const problemItems = schema.items.filter(cst => isProblematic(cst));
  const countProblematic = problemItems.length;

  useLayoutEffect(
    function updateWindowTitle() {
      const oldTitle = document.title;
      document.title = model.title;
      return () => {
        document.title = oldTitle;
      };
    },
    [model.title]
  );

  useLayoutEffect(
    function hideFooterOnForSomeTabs() {
      const nextNoFooter = activeTab !== RSModelTabID.CARD;
      onHideFooterEvent(nextNoFooter);
    },
    [activeTab]
  );

  useEffect(function restoreFooterOnUnmount() {
    return () => onHideFooterEvent(false);
  }, []);

  useLayoutEffect(
    function syncNavigationAndSelection() {
      if (
        activeTab === RSModelTabID.CST_EDIT ||
        activeTab === RSModelTabID.VALUE_EDIT ||
        activeTab === RSModelTabID.EVALUATOR
      ) {
        // Same contract as RSForm `RSFormTabs`: user navigations must call `clearPendingActiveID()` at the source.
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
    clearPendingActiveID();
    router.changeTab(index);
  }

  function onFocusProblematic(event: React.MouseEvent<HTMLDivElement>) {
    focusProblematic();
    if (event.ctrlKey || event.metaKey) {
      setSelectedCst(problemItems.map(cst => cst.id));
    } else {
      clearPendingActiveID();
      router.gotoEditActive(problemItems[0].id);
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
      <TabList
        className={clsx(
          'absolute z-sticky',
          'flex self-start xs:self-auto',
          'border-b-2 border-x-2 divide-x-2',
          'bg-background'
        )}
      >
        {countProblematic > 0 ? (
          <IndicatorPill
            className='absolute top-1.5 -left-1.5 -translate-x-full hidden xs:inline-flex'
            icon={<IconStatusError size='0.8rem' />}
            value={countProblematic}
            color='destructive'
            title={`Проблемных понятий: ${countProblematic}`}
            onClick={onFocusProblematic}
          />
        ) : null}
        <MenuModel />

        <TabLabel label='Паспорт' />
        <TabLabel label='Список' />
        <TabLabel label='Понятие' />
        <TabLabel label='Граф' />
        <TabLabel label='Данные' />
        <TabLabel label='Расчет' />
      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <TabModelCard />
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
