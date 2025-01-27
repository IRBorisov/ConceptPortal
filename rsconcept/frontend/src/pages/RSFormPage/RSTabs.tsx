'use client';

import clsx from 'clsx';
import { useEffect } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import useQueryStrings from '@/hooks/useQueryStrings';
import { useAppLayoutStore } from '@/stores/appLayout';
import { useModificationStore } from '@/stores/modification';
import { labelVersion } from '@/utils/labels';

import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSFormCard';
import EditorRSList from './EditorRSList';
import EditorTermGraph from './EditorTermGraph';
import MenuRSTabs from './MenuRSTabs';
import { RSTabID, useRSEdit } from './RSEditContext';

function RSTabs() {
  const query = useQueryStrings();
  const router = useConceptNavigation();
  const activeTab = query.get('tab') ? (Number(query.get('tab')) as RSTabID) : RSTabID.CARD;
  const cstQuery = query.get('active');

  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const { setIsModified } = useModificationStore();
  const { schema, selected, setSelected, navigateRSForm } = useRSEdit();

  useEffect(() => setIsModified(false), [setIsModified]);

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
      const cstID = Number(cstQuery);
      if (cstID && schema.cstByID.has(cstID)) {
        setSelected([cstID]);
      } else {
        setSelected([]);
      }
    }
    return () => hideFooter(false);
  }, [activeTab, cstQuery, setSelected, schema, hideFooter, setIsModified]);

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
