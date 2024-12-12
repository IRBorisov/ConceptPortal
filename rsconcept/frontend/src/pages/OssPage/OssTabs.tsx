'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Loader from '@/components/ui/Loader';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import TextURL from '@/components/ui/TextURL';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useLibrary } from '@/context/LibraryContext';
import { useBlockNavigation, useConceptNavigation } from '@/context/NavigationContext';
import { useOSS } from '@/context/OssContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { OperationID } from '@/models/oss';
import { information, prompts } from '@/utils/labels';

import EditorRSForm from './EditorOssCard';
import EditorTermGraph from './EditorOssGraph';
import MenuOssTabs from './MenuOssTabs';
import { OssEditState } from './OssEditContext';

export enum OssTabID {
  CARD = 0,
  GRAPH = 1
}

function OssTabs() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTab = query.get('tab') ? (Number(query.get('tab')) as OssTabID) : OssTabID.GRAPH;
  const { user } = useAuth();

  const { setNoFooter } = useConceptOptions();
  const { schema, loading, loadingError: errorLoading } = useOSS();
  const { destroyItem } = useLibrary();

  const [isModified, setIsModified] = useState(false);
  const [selected, setSelected] = useState<OperationID[]>([]);
  useBlockNavigation(
    isModified &&
      schema !== undefined &&
      user !== undefined &&
      (user.is_staff || user.id == schema.owner || schema.editors.includes(user.id))
  );

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
    setNoFooter(activeTab === OssTabID.GRAPH);
  }, [activeTab, setNoFooter]);

  const navigateTab = useCallback(
    (tab: OssTabID) => {
      if (!schema) {
        return;
      }
      const url = urls.oss_props({
        id: schema.id,
        tab: tab
      });
      router.push(url);
    },
    [router, schema]
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
    navigateTab(index);
  }

  const onDestroySchema = useCallback(() => {
    if (!schema || !window.confirm(prompts.deleteOSS)) {
      return;
    }
    destroyItem(schema.id, () => {
      toast.success(information.itemDestroyed);
      router.push(urls.library);
    });
  }, [schema, destroyItem, router]);

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

  const graphPanel = useMemo(
    () => (
      <TabPanel>
        <EditorTermGraph isModified={isModified} setIsModified={setIsModified} />
      </TabPanel>
    ),
    [isModified]
  );

  return (
    <OssEditState selected={selected} setSelected={setSelected}>
      {loading ? <Loader /> : null}
      {errorLoading ? <ProcessError error={errorLoading} /> : null}
      {schema && !loading ? (
        <Tabs
          selectedIndex={activeTab}
          onSelect={onSelectTab}
          defaultFocus
          selectedTabClassName='clr-selected'
          className='flex flex-col mx-auto min-w-fit'
        >
          <Overlay position='top-0 right-1/2 translate-x-1/2' layer='z-sticky'>
            <TabList className={clsx('w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2')}>
              <MenuOssTabs onDestroy={onDestroySchema} />

              <TabLabel label='Карточка' title={schema.title ?? ''} />
              <TabLabel label='Граф' />
            </TabList>
          </Overlay>

          <div className='overflow-x-hidden'>
            {cardPanel}
            {graphPanel}
          </div>
        </Tabs>
      ) : null}
    </OssEditState>
  );
}

export default OssTabs;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{`Операционная схема с указанным идентификатором отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
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
