'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Divider from '@/components/ui/Divider';
import Loader from '@/components/ui/Loader';
import TabLabel from '@/components/ui/TabLabel';
import TextURL from '@/components/ui/TextURL';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useLibrary } from '@/context/LibraryContext';
import { useBlockNavigation, useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { useRSForm } from '@/context/RSFormContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { ConstituentaID, IConstituenta, IConstituentaMeta } from '@/models/rsform';
import { PARAMETER, prefixes } from '@/utils/constants';
import { labelVersion } from '@/utils/labels';

import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSFormCard';
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
  const version = query.get('v') ? Number(query.get('v')) : undefined;
  const cstQuery = query.get('active');

  const { setNoFooter, calculateHeight } = useConceptOptions();
  const { schema, loading, errorLoading, isArchive, itemID } = useRSForm();
  const { destroyItem } = useLibrary();

  const [isModified, setIsModified] = useState(false);
  useBlockNavigation(isModified);

  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const activeCst: IConstituenta | undefined = useMemo(() => {
    if (!schema || selected.length === 0) {
      return undefined;
    } else {
      return schema.cstByID.get(selected.at(-1)!);
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
      if (cstID && schema && schema.cstByID.has(cstID)) {
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
    (tab: RSTabID, activeID?: ConstituentaID) => {
      if (!schema) {
        return;
      }
      const url = urls.schema_props({
        id: schema.id,
        tab: tab,
        active: activeID,
        version: version
      });
      if (activeID) {
        if (tab === activeTab && tab !== RSTabID.CST_EDIT) {
          router.replace(url);
        } else {
          router.push(url);
        }
      } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
        activeID = schema.items[0].id;
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, schema, activeTab, version]
  );

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
    navigateTab(index, selected.length > 0 ? selected.at(-1) : undefined);
  }

  const onCreateCst = useCallback(
    (newCst: IConstituentaMeta) => {
      navigateTab(activeTab, newCst.id);
      if (activeTab === RSTabID.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'end'
            });
          }
        }, PARAMETER.refreshTimeout);
      }
    },
    [activeTab, navigateTab]
  );

  const onDeleteCst = useCallback(
    (newActive?: ConstituentaID) => {
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
    (cstID: ConstituentaID) => {
      if (cstID !== activeCst?.id || activeTab !== RSTabID.CST_EDIT) {
        navigateTab(RSTabID.CST_EDIT, cstID);
      }
    },
    [navigateTab, activeCst, activeTab]
  );

  const onDestroySchema = useCallback(() => {
    if (!schema || !window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      return;
    }
    destroyItem(schema.id, () => {
      toast.success('Схема удалена');
      router.push(urls.library);
    });
  }, [schema, destroyItem, router]);

  const panelHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);

  const cardPanel = useMemo(
    () => (
      <TabPanel>
        <EditorRSForm
          isModified={isModified} // prettier: split lines
          setIsModified={setIsModified}
          onDestroy={onDestroySchema}
        />
      </TabPanel>
    ),
    [isModified, onDestroySchema]
  );

  const listPanel = useMemo(
    () => (
      <TabPanel>
        <EditorRSList onOpenEdit={onOpenCst} />
      </TabPanel>
    ),
    [onOpenCst]
  );

  const editorPanel = useMemo(
    () => (
      <TabPanel>
        <EditorConstituenta
          isModified={isModified}
          setIsModified={setIsModified}
          activeCst={activeCst}
          onOpenEdit={onOpenCst}
        />
      </TabPanel>
    ),
    [isModified, setIsModified, activeCst, onOpenCst]
  );

  const graphPanel = useMemo(
    () => (
      <TabPanel>
        <EditorTermGraph onOpenEdit={onOpenCst} />
      </TabPanel>
    ),
    [onOpenCst]
  );

  return (
    <RSEditState
      selected={selected}
      setSelected={setSelected}
      activeCst={activeCst}
      isModified={isModified}
      onCreateCst={onCreateCst}
      onDeleteCst={onDeleteCst}
    >
      {loading ? <Loader /> : null}
      {errorLoading ? <ProcessError error={errorLoading} isArchive={isArchive} itemID={itemID} /> : null}
      {schema && !loading ? (
        <Tabs
          selectedIndex={activeTab}
          onSelect={onSelectTab}
          defaultFocus
          selectedTabClassName='clr-selected'
          className='flex flex-col mx-auto min-w-fit'
        >
          <TabList className={clsx('mx-auto w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2')}>
            <RSTabsMenu onDestroy={onDestroySchema} />

            <TabLabel
              label='Карточка'
              titleHtml={`Название: <b>${schema.title ?? ''}</b><br />Версия: ${labelVersion(schema)}`}
            />
            <TabLabel
              label='Содержание'
              titleHtml={`Конституент: ${schema.stats?.count_all ?? 0}<br />Ошибок: ${schema.stats?.count_errors ?? 0}`}
            />
            <TabLabel label='Редактор' />
            <TabLabel label='Граф термов' />
          </TabList>

          <AnimateFade className='overflow-y-auto' style={{ maxHeight: panelHeight }}>
            {cardPanel}
            {listPanel}
            {editorPanel}
            {graphPanel}
          </AnimateFade>
        </Tabs>
      ) : null}
    </RSEditState>
  );
}

export default RSTabs;

// ====== Internals =========
function ProcessError({
  error,
  isArchive,
  itemID
}: {
  error: ErrorData;
  isArchive: boolean;
  itemID: string;
}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{`Концептуальная схема с указанным идентификатором ${isArchive ? 'и версией ' : ''}отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
            {isArchive ? <Divider vertical margins='mx-3' /> : null}
            {isArchive ? <TextURL text='Актуальная версия' href={`/rsforms/${itemID}`} /> : null}
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>Владелец ограничил доступ к данной схеме</p>
          <TextURL text='Библиотека' href='/library' />
        </div>
      );
    }
  }
  return <InfoError error={error} />;
}
