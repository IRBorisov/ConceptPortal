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

enum TabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSFormTabs() {
  const { setActive, active, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useLocalStorage('rsform_edit_tab', TabsList.CARD);

  const onEditCst = (cst: IConstituenta) => {
    console.log(`Set active cst: ${cst.alias}`);
    setActive(cst);
    setTabIndex(TabsList.CST_EDIT)
  };

  const onSelectTab = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const activeQuery = url.searchParams.get('active');
    const activeCst = schema?.items?.find((cst) => cst.entityUID === Number(activeQuery)) || undefined;
    setActive(activeCst);
  }, [setActive, schema?.items]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tabQuery = url.searchParams.get('tab');
    setTabIndex(Number(tabQuery) || TabsList.CARD);
  }, [setTabIndex]);

  useEffect(() => {
    let url = new URL(window.location.href);
    url.searchParams.set('tab', String(tabIndex));
    if (active) {
      url.searchParams.set('active', String(active.entityUID));
    } else {
      url.searchParams.delete('active');
    }
    window.history.replaceState(null, '', url.toString());    
  }, [tabIndex, active]);

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
          {schema.stats && <RSFormStats stats={schema.stats}/>}
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