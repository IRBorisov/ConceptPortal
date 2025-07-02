'use client';

import { useLayoutEffect } from 'react';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useAppLayoutStore } from '@/stores/app-layout';

import { EditorOssCard } from './editor-oss-card';
import { EditorOssGraph } from './editor-oss-graph';
import { MenuOssTabs } from './menu-oss-tabs';
import { OssTabID, useOssEdit } from './oss-edit-context';

interface OssTabsProps {
  activeTab: OssTabID;
}

export function OssTabs({ activeTab }: OssTabsProps) {
  const router = useConceptNavigation();
  const { schema, navigateTab } = useOssEdit();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);

  useLayoutEffect(() => {
    const oldTitle = document.title;
    document.title = schema.title;
    return () => {
      document.title = oldTitle;
    };
  }, [schema.title]);

  useLayoutEffect(() => {
    hideFooter(activeTab === OssTabID.GRAPH);
  }, [activeTab, hideFooter]);

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
    navigateTab(index as OssTabID);
  }

  return (
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus
      className='relative flex flex-col mx-auto min-w-fit items-center'
    >
      <TabList className='absolute z-sticky flex border-b-2 border-x-2 divide-x-2'>
        <MenuOssTabs />

        <TabLabel label='Паспорт' />
        <TabLabel label='Граф' />
      </TabList>

      <div className='overflow-x-hidden'>
        <TabPanel>
          <EditorOssCard />
        </TabPanel>

        <TabPanel>
          <EditorOssGraph />
        </TabPanel>
      </div>
    </Tabs>
  );
}
