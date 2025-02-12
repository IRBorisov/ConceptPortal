'use client';

import { useEffect } from 'react';
import clsx from 'clsx';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';

import { Overlay } from '@/components/Container';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useAppLayoutStore } from '@/stores/appLayout';
import { useModificationStore } from '@/stores/modification';

import { labelVersion } from '../../labels';

import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSFormCard';
import EditorRSList from './EditorRSList';
import EditorTermGraph from './EditorTermGraph';
import MenuRSTabs from './MenuRSTabs';
import { RSTabID, useRSEdit } from './RSEditContext';

interface RSTabsProps {
  activeID?: number;
  activeTab: RSTabID;
}

function RSTabs({ activeID, activeTab }: RSTabsProps) {
  const router = useConceptNavigation();

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const { setIsModified } = useModificationStore();
  const { schema, selected, setSelected, navigateRSForm } = useRSEdit();

  useEffect(() => {
    const oldTitle = document.title;
    document.title = schema.title;
    return () => {
      document.title = oldTitle;
    };
  }, [schema.title]);

  useEffect(() => {
    hideFooter(activeTab !== RSTabID.CARD);
    setIsModified(false);
    if (activeTab === RSTabID.CST_EDIT) {
      if (activeID && schema.cstByID.has(activeID)) {
        setSelected([activeID]);
      } else {
        setSelected([]);
      }
    }
    return () => hideFooter(false);
  }, [activeTab, activeID, setSelected, schema, hideFooter, setIsModified]);

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
    navigateRSForm({ tab: index, activeID: selected.length > 0 ? selected.at(-1) : undefined });
  }

  return (
    <>
      <Tabs
        selectedIndex={activeTab}
        onSelect={onSelectTab}
        defaultFocus
        selectedTabClassName='clr-selected'
        className='flex flex-col mx-auto min-w-fit'
      >
        <Overlay position='top-0 right-1/2 translate-x-1/2' layer='z-sticky'>
          <TabList
            className={clsx('mx-auto w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2', 'bg-prim-200')}
          >
            <MenuRSTabs />

            <TabLabel label='Карточка' titleHtml={`${schema.title ?? ''}<br />Версия: ${labelVersion(schema)}`} />
            <TabLabel
              label='Содержание'
              titleHtml={`Конституент: ${schema.stats?.count_all ?? 0}<br />Ошибок: ${schema.stats?.count_errors ?? 0}`}
            />
            <TabLabel label='Редактор' />
            <TabLabel label='Граф термов' />
          </TabList>
        </Overlay>

        <div className='overflow-x-hidden'>
          <TabPanel>
            <EditorRSForm />
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
    </>
  );
}

export default RSTabs;
