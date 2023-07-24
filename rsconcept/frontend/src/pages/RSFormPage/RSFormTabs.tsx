import { Tabs, TabList, TabPanel } from 'react-tabs';
import ConstituentsTable from './ConstituentsTable';
import { IConstituenta } from '../../utils/models';
import { useRSForm } from '../../context/RSFormContext';
import { useEffect, useLayoutEffect, useState } from 'react';
import ConceptTab from '../../components/Common/ConceptTab';
import RSFormCard from './RSFormCard';
import { Loader } from '../../components/Common/Loader';
import BackendError from '../../components/BackendError';
import ConstituentEditor from './ConstituentEditor';
import RSFormStats from './RSFormStats';
import useLocalStorage from '../../hooks/useLocalStorage';
import TablistTools from './TablistTools';

export enum RSFormTabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSFormTabs() {
  const { setActiveID, activeCst, activeID, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useLocalStorage('rsform_edit_tab', RSFormTabsList.CARD);
  const [init, setInit] = useState(false);

  const onEditCst = (cst: IConstituenta) => {
    console.log(`Set active cst: ${cst.alias}`);
    setActiveID(cst.id);
    setTabIndex(RSFormTabsList.CST_EDIT)
  };

  const onSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useLayoutEffect(() => {
    if (schema) {
      const url = new URL(window.location.href);
      const activeQuery = url.searchParams.get('active');
      const activeCst = schema?.items?.find((cst) => cst.id === Number(activeQuery)) || undefined;
      setActiveID(activeCst?.id);
      setInit(true);
    }
  }, [setActiveID, schema, setInit]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tabQuery = url.searchParams.get('tab');
    setTabIndex(Number(tabQuery) || RSFormTabsList.CARD);
  }, [setTabIndex]);

  useEffect(() => {
    if (init) {
      const url = new URL(window.location.href);
      let currentActive = url.searchParams.get('active');
      const currentTab = url.searchParams.get('tab');
      const saveHistory = tabIndex === RSFormTabsList.CST_EDIT && currentActive !== String(activeID);
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
    <Tabs 
      selectedIndex={tabIndex}
      onSelect={onSelectTab}
      defaultFocus={true}
      selectedTabClassName='font-bold'
    >
      <TabList className='flex items-start w-fit clr-bg-pop'>
        <TablistTools />
        <ConceptTab>Паспорт схемы</ConceptTab>
        <ConceptTab className='border-x-2 clr-border min-w-[10rem] flex justify-between gap-2'>
          <span>Конституенты</span>
          <span>{`${schema.stats?.count_errors} | ${schema.stats?.count_all}`}</span> 
        </ConceptTab>
        <ConceptTab>Редактор</ConceptTab>
      </TabList>

      <TabPanel className='flex items-start w-full gap-2'>
        <RSFormCard />
        {schema.stats && <RSFormStats stats={schema.stats}/>}
      </TabPanel>

      <TabPanel className='w-full'>
        <ConstituentsTable onOpenEdit={onEditCst} />
      </TabPanel>

      <TabPanel>
        <ConstituentEditor />
      </TabPanel>
    </Tabs>
    }
  </div>);
}

export default RSFormTabs;