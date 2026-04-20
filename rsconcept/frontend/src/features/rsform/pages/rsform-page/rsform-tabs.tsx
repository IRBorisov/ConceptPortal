'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';

import { isProblematic } from '@/domain/library/rsform-api';

import { RSTabID, useConceptNavigation } from '@/app/navigation/navigation-context';

import { IconStatusError } from '@/components/icons';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { IndicatorPill } from '@/components/view/indicator-pill';
import { useResetAttribute } from '@/hooks/use-reset-attribute';
import { useAppLayoutStore } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';

import { useCstSearchStore } from '../../stores/cst-search';

import { MenuGroupSchema } from './menu-group-schema';
import { useSchemaEdit } from './schema-edit-context';
import { TabConstituenta } from './tab-constituenta';
import { TabSchemaCard } from './tab-schema-card';
import { TabSchemaGraph } from './tab-schema-graph';
import { TabSchemaList } from './tab-schema-list';

interface RSFormTabsProps {
  activeID?: number;
  activeTab: RSTabID;
}

export function RSFormTabs({ activeID, activeTab }: RSFormTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const onHideFooterEvent = useEffectEvent(hideFooter);

  const setIsModified = useModificationStore(state => state.setIsModified);
  const focusProblematic = useCstSearchStore(state => state.focusProblematic);
  const { schema, selectedCst, setSelectedCst, setSelectedEdges, deselectAll, pendingActiveID, clearPendingActiveID } =
    useSchemaEdit();

  const problemItems = schema.items.filter(cst => isProblematic(cst));
  const countProblematic = problemItems.length;

  useLayoutEffect(
    function updateWindowTitle() {
      const oldTitle = document.title;
      document.title = schema.title;
      return () => {
        document.title = oldTitle;
      };
    },
    [schema.title]
  );

  useLayoutEffect(
    function hideFooterOnForSomeTabs() {
      const nextNoFooter = activeTab !== RSTabID.CARD;
      onHideFooterEvent(nextNoFooter);
    },
    [activeTab]
  );

  useEffect(function restoreFooterOnUnmount() {
    return () => onHideFooterEvent(false);
  }, []);

  useLayoutEffect(
    function syncNavigationAndSelection() {
      if (activeTab === RSTabID.CST_EDIT) {
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

  function onFocusProblematic(event: React.MouseEvent<HTMLDivElement>) {
    focusProblematic();
    if (event.ctrlKey || event.metaKey) {
      setSelectedCst(problemItems.map(cst => cst.id));
    } else {
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
      <TabList className='absolute z-sticky flex border-b-2 border-x-2 divide-x-2 bg-background'>
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
        <MenuGroupSchema />

        <TabLabel label='Паспорт' />
        <TabLabel label='Список' />
        <TabLabel label='Понятие' />
        <TabLabel label='Граф' />
      </TabList>

      <div ref={containerRef} className='overflow-x-hidden'>
        <TabPanel>
          <TabSchemaCard />
        </TabPanel>

        <TabPanel>
          <TabSchemaList />
        </TabPanel>

        <TabPanel>
          <TabConstituenta />
        </TabPanel>

        <TabPanel>
          <TabSchemaGraph />
        </TabPanel>
      </div>
    </Tabs>
  );
}
