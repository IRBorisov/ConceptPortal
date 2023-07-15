import { Tabs, TabList, TabPanel } from 'react-tabs';
import ConstituentsTable from './ConstituentsTable';
import { IConstituenta } from '../../models';
import { useRSForm } from '../../context/RSFormContext';
import { useState } from 'react';
import ConceptTab from '../../components/Common/ConceptTab';
import RSFormCard from './RSFormCard';
import { Loader } from '../../components/Common/Loader';
import BackendError from '../../components/BackendError';
import ConstituentEditor from './ConstituentEditor';
import RSFormStats from './RSFormStats';

enum RSFormTabs {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2
}

function RSFormEditor() {
  const { setActive, error, schema, loading } = useRSForm();
  const [tabIndex, setTabIndex] = useState(RSFormTabs.CARD);

  const onEditCst = (cst: IConstituenta) => {
    console.log(`Set active cst: ${cst.alias}`);
    setActive(cst);
    setTabIndex(RSFormTabs.CST_EDIT)
  };

  return (
  <div className='container w-full'>
    { loading && <Loader /> }
    { error && <BackendError error={error} />}
    { schema && !loading &&
      <Tabs 
        selectedIndex={tabIndex}
        onSelect={(index) => setTabIndex(index)}
        defaultFocus={true}
        selectedTabClassName='font-bold'
      >
        <TabList className='flex items-start w-fit'>
          <ConceptTab>Паспорт схемы</ConceptTab>
          <ConceptTab className='border-gray-300 border-x-2 dark:border-gray-400'>Конституенты</ConceptTab>
          <ConceptTab>Редактор</ConceptTab>
        </TabList>

        <TabPanel className='flex items-start w-full gap-2 '>
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

export default RSFormEditor;