'use client';

import { useLayoutEffect } from 'react';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { EditorConstituenta } from './editor-constituenta';
import { EditorRSFormCard } from './editor-rsform-card';
import { EditorRSList } from './editor-rslist';
import { EditorTermGraph } from './editor-term-graph';
import { MenuRSTabs } from './menu-rstabs';
import { RSTabID, useRSEdit } from './rsedit-context';

interface RSTabsProps {
  activeID?: number;
  activeTab: RSTabID;
}

export function RSTabs({ activeID, activeTab }: RSTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const { setIsModified } = useModificationStore();
  const { schema, selected, setSelected, deselectAll, navigateRSForm } = useRSEdit();

  useLayoutEffect(() => {
    const oldTitle = document.title;
    document.title = schema.title;
    return () => {
      document.title = oldTitle;
    };
  }, [schema.title]);

  useLayoutEffect(() => {
    hideFooter(activeTab !== RSTabID.CARD);
    setIsModified(false);
    if (activeTab === RSTabID.CST_EDIT) {
      if (activeID && schema.cstByID.has(activeID)) {
        setSelected([activeID]);
      } else if (schema.items.length > 0) {
        setSelected([schema.items[0].id]);
      } else {
        deselectAll();
      }
    }
    return () => hideFooter(false);
  }, [activeTab, activeID, setSelected, deselectAll, schema, hideFooter, setIsModified]);

  function onSelectTab(index: number, last: number, event: Event) {
    if (last === index) {
      return;
    }
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
    navigateRSForm({ tab: index as RSTabID, activeID: selected.length > 0 ? selected.at(-1) : undefined });
  }

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

      <div className='overflow-x-hidden'>
        <TabPanel>
          <EditorRSFormCard />
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
