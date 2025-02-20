'use client';

import { useLayoutEffect } from 'react';
import clsx from 'clsx';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';

import { Overlay } from '@/components/Container';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useAppLayoutStore } from '@/stores/appLayout';

import { EditorOssCard } from './EditorOssCard';
import { EditorOssGraph } from './EditorOssGraph';
import { MenuOssTabs } from './MenuOssTabs';
import { OssTabID, useOssEdit } from './OssEditContext';

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
    navigateTab(index);
  }

  return (
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus
      selectedTabClassName='clr-selected'
      className='flex flex-col mx-auto min-w-fit items-center'
    >
      <Overlay position='top-0 right-1/2 translate-x-1/2' layer='z-sticky'>
        <TabList className={clsx('w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2', 'bg-prim-200')}>
          <MenuOssTabs />

          <TabLabel label='Карточка' title={schema.title ?? ''} />
          <TabLabel label='Граф' />
        </TabList>
      </Overlay>

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
