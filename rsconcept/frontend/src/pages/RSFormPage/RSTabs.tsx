'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Divider from '@/components/ui/Divider';
import Loader from '@/components/ui/Loader';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import TextURL from '@/components/ui/TextURL';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useGlobalOss } from '@/context/GlobalOssContext';
import { useLibrary } from '@/context/LibraryContext';
import { useBlockNavigation, useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { ConstituentaID, IConstituenta, IConstituentaMeta } from '@/models/rsform';
import { PARAMETER, prefixes } from '@/utils/constants';
import { information, labelVersion, prompts } from '@/utils/labels';

import { OssTabID } from '../OssPage/OssTabs';
import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSFormCard';
import EditorRSList from './EditorRSList';
import EditorTermGraph from './EditorTermGraph';
import MenuRSTabs from './MenuRSTabs';
import { RSEditState } from './RSEditContext';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

function RSTabs() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTab = query.get('tab') ? (Number(query.get('tab')) as RSTabID) : RSTabID.CARD;
  const version = query.get('v') ? Number(query.get('v')) : undefined;
  const cstQuery = query.get('active');

  const { setNoFooter } = useConceptOptions();
  const { schema, loading, errorLoading, isArchive, itemID } = useRSForm();
  const library = useLibrary();
  const oss = useGlobalOss();

  const [isModified, setIsModified] = useState(false);
  useBlockNavigation(isModified);

  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const activeCst: IConstituenta | undefined = (() => {
    if (!schema || selected.length === 0) {
      return undefined;
    } else {
      return schema.cstByID.get(selected.at(-1)!);
    }
  })();

  useEffect(() => {
    if (schema) {
      const oldTitle = document.title;
      document.title = schema.title;
      return () => {
        document.title = oldTitle;
      };
    }
  }, [schema, schema?.title]);

  useEffect(() => {
    setNoFooter(activeTab !== RSTabID.CARD);
    setIsModified(false);
    if (activeTab === RSTabID.CST_EDIT) {
      const cstID = Number(cstQuery);
      if (cstID && schema?.cstByID.has(cstID)) {
        setSelected([cstID]);
      } else {
        setSelected([]);
      }
    }
    return () => setNoFooter(false);
  }, [activeTab, cstQuery, setSelected, schema, setNoFooter, setIsModified]);

  function navigateTab(tab: RSTabID, activeID?: ConstituentaID) {
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
  }

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

  function onCreateCst(newCst: IConstituentaMeta) {
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
  }

  function onDeleteCst(newActive?: ConstituentaID) {
    if (!newActive) {
      navigateTab(RSTabID.CST_LIST);
    } else if (activeTab === RSTabID.CST_EDIT) {
      navigateTab(activeTab, newActive);
    } else {
      navigateTab(activeTab);
    }
  }

  function onOpenCst(cstID: ConstituentaID) {
    if (cstID !== activeCst?.id || activeTab !== RSTabID.CST_EDIT) {
      navigateTab(RSTabID.CST_EDIT, cstID);
    }
  }

  function onDestroySchema() {
    if (!schema || !window.confirm(prompts.deleteLibraryItem)) {
      return;
    }
    const backToOSS = oss.schema?.schemas.includes(schema.id);
    library.destroyItem(schema.id, () => {
      toast.success(information.itemDestroyed);
      if (backToOSS) {
        oss.invalidate();
        router.push(urls.oss(oss.schema!.id, OssTabID.GRAPH));
      } else {
        router.push(urls.library);
      }
    });
  }

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
          <Overlay position='top-0 right-1/2 translate-x-1/2' layer='z-sticky'>
            <TabList
              className={clsx('mx-auto w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2', 'bg-prim-200')}
            >
              <MenuRSTabs onDestroy={onDestroySchema} />

              <TabLabel label='Карточка' titleHtml={`${schema.title ?? ''}<br />Версия: ${labelVersion(schema)}`} />
              <TabLabel
                label='Содержание'
                titleHtml={`Конституент: ${schema.stats?.count_all ?? 0}<br />Ошибок: ${
                  schema.stats?.count_errors ?? 0
                }`}
              />
              <TabLabel label='Редактор' />
              <TabLabel label='Граф термов' />
            </TabList>
          </Overlay>

          <div className='overflow-x-hidden'>
            <TabPanel>
              <EditorRSForm
                isModified={isModified} // prettier: split lines
                setIsModified={setIsModified}
                onDestroy={onDestroySchema}
              />
            </TabPanel>

            <TabPanel>
              <EditorRSList onOpenEdit={onOpenCst} />
            </TabPanel>

            <TabPanel>
              <EditorConstituenta
                isModified={isModified}
                setIsModified={setIsModified}
                activeCst={activeCst}
                onOpenEdit={onOpenCst}
              />
            </TabPanel>

            <TabPanel>
              <EditorTermGraph onOpenEdit={onOpenCst} />
            </TabPanel>
          </div>
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
