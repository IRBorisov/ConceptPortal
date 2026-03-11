'use client';

import { useLayoutEffect, useRef } from 'react';

import { RSModelTabID, useConceptNavigation } from '@/app/navigation/navigation-context';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { TabConstituenta } from '@/features/rsform/pages/rsform-page/tab-constituenta';
import { TabTermGraph } from '@/features/rsform/pages/rsform-page/tab-term-graph';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { MenuRSModel } from './menu-rsmodel';
import { useRSModelEdit } from './rsmodel-context';
import { TabModelCard } from './tab-model-card';
import { TabRSList } from './tab-rslist';
import { TabValue } from './tab-value';

interface RSModelTabsProps {
  activeID?: number;
  activeTab: RSModelTabID;
}

export function RSModelTabs({ activeID, activeTab }: RSModelTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { schema, selectedCst, setSelectedCst, setSelectedEdges, deselectAll } = useRSFormEdit();
  const { model } = useRSModelEdit();

  useLayoutEffect(() => {
    const oldTitle = document.title;
    document.title = model.title;
    return () => {
      document.title = oldTitle;
    };
  }, [model.title]);

  useLayoutEffect(() => {
    const nextNoFooter = activeTab !== RSModelTabID.CARD;
    hideFooter(nextNoFooter);

    if (activeTab === RSModelTabID.CST_EDIT || activeTab === RSModelTabID.VALUE_EDIT) {
      let nextSelected: number[] = [];
      if (activeID && schema.cstByID.has(activeID)) {
        nextSelected = [activeID];
      } else if (schema.items.length > 0) {
        nextSelected = [schema.items[0].id];
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
  }, [activeTab, activeID, selectedCst, schema, hideFooter, setSelectedCst, deselectAll]);

  useLayoutEffect(() => {
    return () => hideFooter(false);
  }, [hideFooter]);

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
        <MenuRSModel />

        <TabLabel label='Паспорт' />
        <TabLabel label='Список' />
        <TabLabel label='Понятие' />
        <TabLabel label='Граф' />
        <TabLabel label='Данные' />
        <TabLabel label='Движок' />

      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <TabModelCard />
        </TabPanel>

        <TabPanel>
          <TabRSList />
        </TabPanel>

        <TabPanel>
          <TabConstituenta />
        </TabPanel>

        <TabPanel>
          <TabTermGraph />
        </TabPanel>

        <TabPanel>
          <TabValue />
        </TabPanel>
      </div>
    </Tabs>
  );
}
