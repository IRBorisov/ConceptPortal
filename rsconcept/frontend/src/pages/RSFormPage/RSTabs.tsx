'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import AnimateFade from '@/components/AnimateFade';
import TabLabel from '@/components/ui/TabLabel';
import { useLibrary } from '@/context/LibraryContext';
import { useBlockNavigation, useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import { useConceptTheme } from '@/context/ThemeContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { IConstituenta, IConstituentaMeta } from '@/models/rsform';
import { prefixes, TIMEOUT_UI_REFRESH } from '@/utils/constants';

import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSForm';
import EditorRSList from './EditorRSList';
import EditorTermGraph from './EditorTermGraph';
import { RSEditState } from './RSEditContext';
import RSTabsMenu from './RSTabsMenu';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

function RSTabs() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTab = (Number(query.get('tab')) ?? RSTabID.CARD) as RSTabID;
  const cstQuery = query.get('active');

  const { schema, loading } = useRSForm();
  const { destroyItem } = useLibrary();
  const { setNoFooter } = useConceptTheme();

  const [isModified, setIsModified] = useState(false);
  useBlockNavigation(isModified);

  const [selected, setSelected] = useState<number[]>([]);
  const activeCst: IConstituenta | undefined = useMemo(() => {
    if (!schema || selected.length === 0) {
      return undefined;
    } else {
      return schema.items.find(cst => cst.id === selected.at(-1));
    }
  }, [schema, selected]);

  useLayoutEffect(() => {
    if (schema) {
      const oldTitle = document.title;
      document.title = schema.title;
      return () => {
        document.title = oldTitle;
      };
    }
  }, [schema, schema?.title]);

  useLayoutEffect(() => {
    setNoFooter(activeTab === RSTabID.CST_EDIT || activeTab === RSTabID.CST_LIST);
    setIsModified(false);
    if (activeTab === RSTabID.CST_EDIT) {
      const cstID = Number(cstQuery);
      if (cstID && schema && schema.items.find(cst => cst.id === cstID)) {
        setSelected([cstID]);
      } else if (schema && schema?.items.length > 0) {
        setSelected([schema.items[0].id]);
      } else {
        setSelected([]);
      }
    }
    return () => setNoFooter(false);
  }, [activeTab, cstQuery, setSelected, schema, setNoFooter, setIsModified]);

  const navigateTab = useCallback(
    (tab: RSTabID, activeID?: number) => {
      if (!schema) {
        return;
      }
      if (activeID) {
        if (tab === activeTab && tab !== RSTabID.CST_EDIT) {
          router.replace(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
        } else {
          router.push(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
        }
      } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
        activeID = schema.items[0].id;
        router.replace(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
      } else {
        router.push(`/rsforms/${schema.id}?tab=${tab}`);
      }
    },
    [router, schema, activeTab]
  );

  function onSelectTab(index: number) {
    navigateTab(index, selected.length > 0 ? selected.at(-1) : undefined);
  }

  const onCreateCst = useCallback(
    (newCst: IConstituentaMeta) => {
      navigateTab(activeTab, newCst.id);
      if (activeTab === RSTabID.CST_EDIT || activeTab === RSTabID.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest'
            });
          }
        }, TIMEOUT_UI_REFRESH);
      }
    },
    [activeTab, navigateTab]
  );

  const onDeleteCst = useCallback(
    (newActive?: number) => {
      if (!newActive) {
        navigateTab(RSTabID.CST_LIST);
      } else if (activeTab === RSTabID.CST_EDIT) {
        navigateTab(activeTab, newActive);
      } else {
        navigateTab(activeTab);
      }
    },
    [activeTab, navigateTab]
  );

  const onOpenCst = useCallback(
    (cstID: number) => {
      setSelected([cstID]);
      navigateTab(RSTabID.CST_EDIT, cstID);
    },
    [navigateTab]
  );

  const onDestroySchema = useCallback(() => {
    if (!schema || !window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      return;
    }
    destroyItem(schema.id, () => {
      toast.success('Схема удалена');
      router.push('/library');
    });
  }, [schema, destroyItem, router]);

  return (
    <RSEditState
      selected={selected}
      setSelected={setSelected}
      activeCst={activeCst}
      isModified={isModified}
      onCreateCst={onCreateCst}
      onDeleteCst={onDeleteCst}
    >
      {schema && !loading ? (
        <Tabs
          selectedIndex={activeTab}
          onSelect={onSelectTab}
          defaultFocus
          selectedTabClassName='clr-selected'
          className='flex flex-col min-w-[45rem]'
        >
          <TabList className={clsx('mx-auto', 'flex', 'border-b-2 border-x-2 divide-x-2')}>
            <RSTabsMenu onDestroy={onDestroySchema} />

            <TabLabel label='Карточка' title={`Название схемы: ${schema.title ?? ''}`} />
            <TabLabel
              label='Содержание'
              title={`Конституент: ${schema.stats?.count_all ?? 0} | Ошибок: ${schema.stats?.count_errors ?? 0}`}
            />
            <TabLabel label='Редактор' />
            <TabLabel label='Граф термов' />
          </TabList>

          <AnimateFade>
            <TabPanel forceRender style={{ display: activeTab === RSTabID.CARD ? '' : 'none' }}>
              <EditorRSForm
                isModified={isModified} // prettier: split lines
                setIsModified={setIsModified}
                onDestroy={onDestroySchema}
              />
            </TabPanel>

            <TabPanel forceRender style={{ display: activeTab === RSTabID.CST_LIST ? '' : 'none' }}>
              <EditorRSList selected={selected} setSelected={setSelected} onOpenEdit={onOpenCst} />
            </TabPanel>

            <TabPanel forceRender style={{ display: activeTab === RSTabID.CST_EDIT ? '' : 'none' }}>
              <EditorConstituenta
                isModified={isModified}
                setIsModified={setIsModified}
                activeCst={activeCst}
                onOpenEdit={onOpenCst}
              />
            </TabPanel>

            <TabPanel style={{ display: activeTab === RSTabID.TERM_GRAPH ? '' : 'none' }}>
              <EditorTermGraph selected={selected} setSelected={setSelected} onOpenEdit={onOpenCst} />
            </TabPanel>
          </AnimateFade>
        </Tabs>
      ) : null}
    </RSEditState>
  );
}

export default RSTabs;
