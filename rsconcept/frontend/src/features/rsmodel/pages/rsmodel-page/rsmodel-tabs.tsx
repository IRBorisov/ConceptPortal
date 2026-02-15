'use client';

import { useLayoutEffect, useRef } from 'react';

import { RSModelTabID, useConceptNavigation } from '@/app/navigation/navigation-context';
import { EditorConstituenta } from '@/features/rsform/pages/rsform-page/editor-constituenta';
import { EditorRSList } from '@/features/rsform/pages/rsform-page/editor-rslist';
import { EditorTermGraph } from '@/features/rsform/pages/rsform-page/editor-term-graph';
import { MenuRSTabs } from '@/features/rsform/pages/rsform-page/menu-rstabs';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { EditorModelCard } from './editor-rsmodel-card';

interface RSModelTabsProps {
  activeID?: number;
  activeTab: RSModelTabID;
}

export function RSModelTabs({ activeID, activeTab }: RSModelTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const { schema, selectedCst, setSelectedCst, setSelectedEdges, deselectAll } = useRSFormEdit();

  useLayoutEffect(() => {
    const oldTitle = document.title;
    document.title = schema.title;
    return () => {
      document.title = oldTitle;
    };
  }, [schema.title]);

  useLayoutEffect(() => {
    const nextNoFooter = activeTab !== RSModelTabID.CARD;
    hideFooter(nextNoFooter);

    if (activeTab === RSModelTabID.CST_EDIT) {
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
        <MenuRSTabs />

        <TabLabel label='Паспорт' />
        <TabLabel label='Список' />
        <TabLabel label='Понятие' />
        <TabLabel label='Граф' />
      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <EditorModelCard />
        </TabPanel>

        <TabPanel>
          <EditorRSList />
        </TabPanel>

        <TabPanel>
          <EditorConstituenta />
        </TabPanel>

        <TabPanel>
          <EditorTermGraph />
        </TabPanel>
      </div>
    </Tabs>
  );
}
