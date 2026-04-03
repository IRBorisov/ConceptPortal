'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';

import { OssTabID, useConceptNavigation } from '@/app/navigation/navigation-context';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';

import { MenuOssTabs } from './menu-oss-tabs';
import { useOssEdit } from './oss-edit-context';
import { TabOssCard } from './tab-oss-card';
import { TabOssGraph } from './tab-oss-graph';

interface OssTabsProps {
  activeTab: OssTabID;
}

export function OssTabs({ activeTab }: OssTabsProps) {
  const router = useConceptNavigation();
  const { schema, deselectAll } = useOssEdit();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const onHideFooterEvent = useEffectEvent(hideFooter);

  const containerRef = useRef<HTMLDivElement>(null);
  useResetAttribute(containerRef, 'data-tooltip-id');

  useLayoutEffect(function updateWindowTitle() {
    const oldTitle = document.title;
    document.title = schema.title;
    return () => {
      document.title = oldTitle;
    };
  }, [schema.title]);

  useLayoutEffect(function hideFooterForGraphTab() {
    onHideFooterEvent(activeTab === OssTabID.GRAPH);
  }, [activeTab]);

  useEffect(function restoreFooterOnUnmount() {
    return () => onHideFooterEvent(false);
  }, []);

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
    deselectAll();
    router.changeTab(index);
  }

  return (
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus
      className='relative flex flex-col mx-auto min-w-fit items-center'
    >
      <TabList className='absolute z-sticky flex border-b-2 border-x-2 divide-x-2 bg-background'>
        <MenuOssTabs />

        <TabLabel label='Паспорт' />
        <TabLabel label='Граф' />
      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <TabOssCard />
        </TabPanel>

        <TabPanel>
          <TabOssGraph />
        </TabPanel>
      </div>
    </Tabs>
  );
}
