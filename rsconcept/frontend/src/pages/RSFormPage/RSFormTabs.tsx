import { Tabs, TabList, TabPanel } from 'react-tabs';
import ConstituentsTable from './ConstituentsTable';
import { IConstituenta } from '../../utils/models';
import { useRSForm } from '../../context/RSFormContext';
import { useEffect, useState } from 'react';
import ConceptTab from '../../components/Common/ConceptTab';
import RSFormCard from './RSFormCard';
import { Loader } from '../../components/Common/Loader';
import BackendError from '../../components/BackendError';
import ConstituentEditor from './ConstituentEditor';
import RSFormStats from './RSFormStats';
import useLocalStorage from '../../hooks/useLocalStorage';
import TablistTools from './TablistTools';

enum TabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSFormTabs() {
  const { setActive, active, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useLocalStorage('rsform_edit_tab', TabsList.CARD);
  const [init, setInit] = useState(false);

  const onEditCst = (cst: IConstituenta) => {
    console.log(`Set active cst: ${cst.alias}`);
    setActive(cst);
    setTabIndex(TabsList.CST_EDIT)
  };

  const onSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    if (schema) {
      const url = new URL(window.location.href);
      const activeQuery = url.searchParams.get('active');
      const activeCst = schema?.items?.find((cst) => cst.entityUID === Number(activeQuery)) || undefined;
      setActive(activeCst);
      setInit(true);
    }
  }, [setActive, schema, setInit]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tabQuery = url.searchParams.get('tab');
    setTabIndex(Number(tabQuery) || TabsList.CARD);
  }, [setTabIndex]);

  useEffect(() => {
    if (init) {
      const url = new URL(window.location.href);
      let currentActive = url.searchParams.get('active');
      const currentTab = url.searchParams.get('tab');
      const saveHistory = tabIndex === TabsList.CST_EDIT && currentActive !== String(active?.entityUID);
      if (currentTab !== String(tabIndex)) {
        url.searchParams.set('tab', String(tabIndex));
      }
      if (active) {
        if (currentActive !== String(active.entityUID)) {
          url.searchParams.set('active', String(active.entityUID));
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
  }, [tabIndex, active, init]);

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