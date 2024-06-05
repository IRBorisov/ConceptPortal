'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Loader from '@/components/ui/Loader';
import TabLabel from '@/components/ui/TabLabel';
import TextURL from '@/components/ui/TextURL';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useLibrary } from '@/context/LibraryContext';
import { useBlockNavigation, useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { useOSS } from '@/context/OssContext';
import useQueryStrings from '@/hooks/useQueryStrings';

import EditorRSForm from './EditorOssCard';
import EditorTermGraph from './EditorOssGraph';
import { OssEditState } from './OssEditContext';
import OssTabsMenu from './OssTabsMenu';

export enum OssTabID {
  CARD = 0,
  GRAPH = 1
}

function OssTabs() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTab = (Number(query.get('tab')) ?? OssTabID.CARD) as OssTabID;

  const { calculateHeight } = useConceptOptions();
  const { schema, loading, errorLoading } = useOSS();
  const { destroyItem } = useLibrary();

  const [isModified, setIsModified] = useState(false);
  useBlockNavigation(isModified);

  useLayoutEffect(() => {
    if (schema) {
      const oldTitle = document.title;
      document.title = schema.title;
      return () => {
        document.title = oldTitle;
      };
    }
  }, [schema, schema?.title]);

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

  const graphPanel = useMemo(
    () => (
      <TabPanel>
        <EditorTermGraph />
      </TabPanel>
    ),
    []
  );

  return (
    <OssEditState>
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
          <TabList className={clsx('mx-auto w-fit', 'flex items-stretch', 'border-b-2 border-x-2 divide-x-2')}>
            <OssTabsMenu onDestroy={onDestroySchema} />

            <TabLabel label='Карточка' titleHtml={`Название: <b>${schema.title ?? ''}</b>`} />
            <TabLabel label='Граф' />
          </TabList>

          <AnimateFade className='overflow-y-auto' style={{ maxHeight: panelHeight }}>
            {cardPanel}
            {graphPanel}
          </AnimateFade>
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
        <div className='p-2 text-center'>
          <p>{`Схема с указанным идентификатором отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='p-2 text-center'>
          <p>Владелец ограничил доступ к данной схеме</p>
          <TextURL text='Библиотека' href='/library' />
        </div>
      );
    }
  }
  return <InfoError error={error} />;
}
