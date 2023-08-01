import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import BackendError from '../../components/BackendError';
import ConceptTab from '../../components/Common/ConceptTab';
import { Loader } from '../../components/Common/Loader';
import { useRSForm } from '../../context/RSFormContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { prefixes, timeout_updateUI } from '../../utils/constants';
import { CstType,type IConstituenta, ICstCreateData, SyntaxTree } from '../../utils/models';
import { createAliasFor } from '../../utils/staticUI';
import DlgCloneRSForm from './DlgCloneRSForm';
import DlgCreateCst from './DlgCreateCst';
import DlgShowAST from './DlgShowAST';
import DlgUploadRSForm from './DlgUploadRSForm';
import EditorConstituenta from './EditorConstituenta';
import EditorItems from './EditorItems';
import EditorRSForm from './EditorRSForm';
import EditorTermGraph from './EditorTermGraph';
import RSFormStats from './elements/RSFormStats';
import RSTabsMenu from './RSTabsMenu';

export enum RSTabsList {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

function RSTabs() {
  const navigate = useNavigate();
  const { setActiveID, activeID, error, schema, loading, cstCreate } = useRSForm();

  const [activeTab, setActiveTab] = useLocalStorage('rsform_edit_tab', RSTabsList.CARD);
  
  const [init, setInit] = useState(false);
  
  const [showUpload, setShowUpload] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [syntaxTree, setSyntaxTree] = useState<SyntaxTree>([]);
  const [expression, setExpression] = useState('');
  const [showAST, setShowAST] = useState(false);
  
  const [defaultType, setDefaultType] = useState<CstType | undefined>(undefined);
  const [insertWhere, setInsertWhere] = useState<number | undefined>(undefined);
  const [showCreateCst, setShowCreateCst] = useState(false);

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
    setActiveTab(Number(tabQuery) || RSTabsList.CARD);
  }, [setActiveTab]);

  useEffect(() => {
    if (init) {
      const url = new URL(window.location.href);
      const currentActive = url.searchParams.get('active');
      const currentTab = url.searchParams.get('tab');
      const saveHistory = activeTab === RSTabsList.CST_EDIT && currentActive !== String(activeID);
      if (currentTab !== String(activeTab)) {
        url.searchParams.set('tab', String(activeTab));
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
  }, [activeTab, activeID, init]);

  function onSelectTab(index: number) {
    setActiveTab(index);
  }

  const handleAddNew = useCallback(
  (type: CstType, selectedCst?: number) => {
    if (!schema?.items) {
      return;
    }
    const data: ICstCreateData = {
      cst_type: type,
      alias: createAliasFor(type, schema),
      insert_after: selectedCst ?? insertWhere ?? null
    }
    cstCreate(data, newCst => {
      toast.success(`Конституента добавлена: ${newCst.alias}`);
      navigate(`/rsforms/${schema.id}?tab=${activeTab}&active=${newCst.id}`);    
      if (activeTab === RSTabsList.CST_EDIT || activeTab == RSTabsList.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: "end",
              inline: "nearest"
            });
          }
        }, timeout_updateUI);
      }
    });
  }, [schema, cstCreate, insertWhere, navigate, activeTab]);

  const onShowCreateCst = useCallback(
    (selectedID: number | undefined, type: CstType | undefined, skipDialog?: boolean) => {
      if (skipDialog && type) {
        handleAddNew(type, selectedID);
      } else {
        setDefaultType(type);
        setInsertWhere(selectedID);
        setShowCreateCst(true);
      }
    }, [handleAddNew]);

  const onShowAST = useCallback(
  (expression: string, ast: SyntaxTree) => {
    setSyntaxTree(ast);
    setExpression(expression);
    setShowAST(true);
  }, []);

  const onEditCst = useCallback(
  (cst: IConstituenta) => {
    setActiveID(cst.id);
    setActiveTab(RSTabsList.CST_EDIT)
  }, [setActiveID, setActiveTab]);

  return (
  <div className='w-full'>
    { loading && <Loader /> }
    { error && <BackendError error={error} />}
    { schema && !loading &&
    <>
    {showUpload && <DlgUploadRSForm hideWindow={() => { setShowUpload(false); }}/>}
    {showClone && <DlgCloneRSForm hideWindow={() => { setShowClone(false); }}/>}
    {showAST && 
    <DlgShowAST
      expression={expression}
      syntaxTree={syntaxTree}
      hideWindow={() => { setShowAST(false); }}
    />}
    {showCreateCst && 
    <DlgCreateCst
        hideWindow={() => { setShowCreateCst(false); }}
        onCreate={handleAddNew}
        defaultType={defaultType}
    />}
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus={true}
      selectedTabClassName='font-bold'
    >
      <TabList className='flex items-start w-fit clr-bg-pop'>
        <RSTabsMenu 
          showCloneDialog={() => setShowClone(true)} 
          showUploadDialog={() => setShowUpload(true)} 
        />
        <ConceptTab className='border-r-2'>Паспорт схемы</ConceptTab>
        <ConceptTab className='border-r-2 min-w-[10rem] flex justify-between gap-2'>
          <span>Конституенты</span>
          <span>{`${schema.stats?.count_errors ?? 0} | ${schema.stats?.count_all ?? 0}`}</span>
        </ConceptTab>
        <ConceptTab className='border-r-2'>Редактор</ConceptTab>
        <ConceptTab>Граф термов</ConceptTab>
      </TabList>

      <TabPanel className='flex items-start w-full gap-2'>
        <EditorRSForm />
        {schema.stats && <RSFormStats stats={schema.stats}/>}
      </TabPanel>

      <TabPanel className='w-full'>
        <EditorItems onOpenEdit={onEditCst} onShowCreateCst={onShowCreateCst} />
      </TabPanel>

      <TabPanel>
        <EditorConstituenta onShowAST={onShowAST} onShowCreateCst={onShowCreateCst} />
      </TabPanel>

      <TabPanel>
        <EditorTermGraph />
      </TabPanel>
    </Tabs>
    </>
    }
  </div>);
}

export default RSTabs;
