import { useEffect, useLayoutEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BackendError from '../../components/BackendError';
import ConceptTab from '../../components/Common/ConceptTab';
import { Loader } from '../../components/Common/Loader';
import { useRSForm } from '../../context/RSFormContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { type IConstituenta } from '../../utils/models';
import DlgCloneRSForm from './DlgCloneRSForm';
import DlgUploadRSForm from './DlgUploadRSForm';
import EditorConstituenta from './EditorConstituenta';
import EditorItems from './EditorItems';
import EditorRSForm from './EditorRSForm';
import RSFormStats from './elements/RSFormStats';
import RSTabsMenu from './RSTabsMenu';

export enum RSTabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSTabs() {
  const { setActiveID, activeID, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useLocalStorage('rsform_edit_tab', RSTabsList.CARD);
  const [init, setInit] = useState(false);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const onEditCst = (cst: IConstituenta) => {
    setActiveID(cst.id);
    setTabIndex(RSTabsList.CST_EDIT)
  };

  const onSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useLayoutEffect(() => {
    if (schema) {
      const url = new URL(window.location.href);
      const activeQuery = url.searchParams.get('active');
      const activeCst = schema.items.find((cst) => cst.id === Number(activeQuery));
      setActiveID(activeCst?.id);
      setInit(true);
      
      const oldTitle = document.title
      document.title = schema.title
      return () => {
        document.title = oldTitle
      }
    }
  }, [setActiveID, schema, schema?.title, setInit]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tabQuery = url.searchParams.get('tab');
    setTabIndex(Number(tabQuery) || RSTabsList.CARD);
  }, [setTabIndex]);

  useEffect(() => {
    if (init) {
      const url = new URL(window.location.href);
      const currentActive = url.searchParams.get('active');
      const currentTab = url.searchParams.get('tab');
      const saveHistory = tabIndex === RSTabsList.CST_EDIT && currentActive !== String(activeID);
      if (currentTab !== String(tabIndex)) {
        url.searchParams.set('tab', String(tabIndex));
      }
      if (activeID) {
        if (currentActive !== String(activeID)) {
          url.searchParams.set('active', String(activeID));
        }
      } else {
        url.searchParams.delete('active');
      }
      if (saveHistory) {
        window.history.pushState(null, '', url.toString());
      } else {
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [tabIndex, activeID, init]);

  return (
  <div className='w-full'>
    { loading && <Loader /> }
    { error && <BackendError error={error} />}
    { schema && !loading &&
    <>
    <DlgUploadRSForm
      show={showUploadDialog}
      hideWindow={() => { setShowUploadDialog(false); }}
    />
    <DlgCloneRSForm
      show={showCloneDialog}
      hideWindow={() => { setShowCloneDialog(false); }}
    />
    <Tabs
      selectedIndex={tabIndex}
      onSelect={onSelectTab}
      defaultFocus={true}
      selectedTabClassName='font-bold'
    >
      <TabList className='flex items-start w-fit clr-bg-pop'>
        <RSTabsMenu 
          showCloneDialog={() => setShowCloneDialog(true)} 
          showUploadDialog={() => setShowUploadDialog(true)} 
        />
        <ConceptTab>Паспорт схемы</ConceptTab>
        <ConceptTab className='border-x-2 clr-border min-w-[10rem] flex justify-between gap-2'>
          <span>Конституенты</span>
          <span>{`${schema.stats?.count_errors ?? 0} | ${schema.stats?.count_all ?? 0}`}</span>
        </ConceptTab>
        <ConceptTab>Редактор</ConceptTab>
      </TabList>

      <TabPanel className='flex items-start w-full gap-2'>
        <EditorRSForm />
        {schema.stats && <RSFormStats stats={schema.stats}/>}
      </TabPanel>

      <TabPanel className='w-full'>
        <EditorItems onOpenEdit={onEditCst} />
      </TabPanel>

      <TabPanel>
        <EditorConstituenta />
      </TabPanel>
    </Tabs></>
    }
  </div>);
}

export default RSTabs;
