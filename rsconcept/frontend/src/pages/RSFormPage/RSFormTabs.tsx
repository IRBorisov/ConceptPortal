import { Tabs, TabList, TabPanel } from 'react-tabs';
import ConstituentsTable from './ConstituentsTable';
import { IConstituenta } from '../../models';
import { useRSForm } from '../../context/RSFormContext';
import { useEffect } from 'react';
import ConceptTab from '../../components/Common/ConceptTab';
import RSFormCard from './RSFormCard';
import { Loader } from '../../components/Common/Loader';
import BackendError from '../../components/BackendError';
import ConstituentEditor from './ConstituentEditor';
import RSFormStats from './RSFormStats';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useLocation } from 'react-router-dom';

enum TabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSFormTabs() {
  const { setActive, active, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useLocalStorage('rsform_edit_tab', TabsList.CARD);
  const search = useLocation().search;

  const onEditCst = (cst: IConstituenta) => {
    console.log(`Set active cst: ${cst.alias}`);
    setActive(cst);
    setTabIndex(TabsList.CST_EDIT)
  };

  const onSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    const tabQuery = new URLSearchParams(search).get('tab');
    const activeQuery = new URLSearchParams(search).get('active');
    const activeCst = schema?.items?.find((cst) => cst.entityUID === Number(activeQuery)) || undefined;
    setTabIndex(Number(tabQuery) || TabsList.CARD);
    setActive(activeCst);
  }, [search, setTabIndex, setActive, schema?.items]);

  useEffect(() => {
    if (schema) {
      let url = `/rsforms/${schema.id}?tab=${tabIndex}`
      if (active) {
        url = url + `&active=${active.entityUID}`
      }
      window.history.replaceState(null, '', url);
    }
  }, [tabIndex, active, schema]);

  return (
  <div className='container w-full'>
    { loading && <Loader /> }
    { error && <BackendError error={error} />}
    { schema && !loading &&
      <Tabs 
        selectedIndex={tabIndex}
        onSelect={onSelectTab}
        defaultFocus={true}
        selectedTabClassName='font-bold'
      >
        <TabList className='flex items-start w-fit'>
          <ConceptTab>Паспорт схемы</ConceptTab>
          <ConceptTab className='border-gray-300 border-x-2 dark:border-gray-400'>Конституенты</ConceptTab>
          <ConceptTab>Редактор</ConceptTab>
        </TabList>

        <TabPanel className='flex items-start w-full gap-2'>
          <RSFormCard />
          <RSFormStats />
        </TabPanel>

        <TabPanel className='w-fit'>
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