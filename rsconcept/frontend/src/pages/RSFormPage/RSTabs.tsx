import { useCallback, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import BackendError from '../../components/BackendError';
import ConceptTab from '../../components/Common/ConceptTab';
import { Loader } from '../../components/Common/Loader';
import { useLibrary } from '../../context/LibraryContext';
import { useRSForm } from '../../context/RSFormContext';
import { prefixes, TIMEOUT_UI_REFRESH } from '../../utils/constants';
import { ICstCreateData, SyntaxTree } from '../../utils/models';
import { createAliasFor } from '../../utils/staticUI';
import DlgCloneRSForm from './DlgCloneRSForm';
import DlgCreateCst from './DlgCreateCst';
import DlgDeleteCst from './DlgDeleteCst';
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
  const search = useLocation().search;
  const { 
    error, schema, loading, 
    cstCreate, cstDelete 
  } = useRSForm();
  const { destroySchema } = useLibrary();

  const [activeTab, setActiveTab] = useState(RSTabsList.CARD);
  const [activeID, setActiveID] = useState<number | undefined>(undefined);
  
  const [showUpload, setShowUpload] = useState(false);
  const [showClone, setShowClone] = useState(false);
  
  const [syntaxTree, setSyntaxTree] = useState<SyntaxTree>([]);
  const [expression, setExpression] = useState('');
  const [showAST, setShowAST] = useState(false);
  
  const [afterDelete, setAfterDelete] = useState<((items: number[]) => void) | undefined>(undefined);
  const [toBeDeleted, setToBeDeleted] = useState<number[]>([]);
  const [showDeleteCst, setShowDeleteCst] = useState(false);
  
  const [createInitialData, setCreateInitialData] = useState<ICstCreateData>();
  const [showCreateCst, setShowCreateCst] = useState(false);

  useLayoutEffect(() => {
    if (schema) {
      const oldTitle = document.title
      document.title = schema.title
      return () => {
        document.title = oldTitle
      }
    }
  }, [schema]);

  useLayoutEffect(() => {
    const activeTab = Number(new URLSearchParams(search).get('tab')) ?? RSTabsList.CARD;
    const cstQuery = new URLSearchParams(search).get('active');
    setActiveTab(activeTab);
    setActiveID(Number(cstQuery) ?? (schema && schema?.items.length > 0 && schema?.items[0]));
  }, [search, setActiveTab, setActiveID, schema]);

  function onSelectTab(index: number) {
    navigateTo(index, activeID);
  }

  const navigateTo = useCallback(
  (tab: RSTabsList, activeID?: number) => {
    if (activeID) {
      navigate(`/rsforms/${schema!.id}?tab=${tab}&active=${activeID}`, {
        replace: tab === activeTab && tab !== RSTabsList.CST_EDIT
      });
    } else {
      navigate(`/rsforms/${schema!.id}?tab=${tab}`);
    }
  }, [navigate, schema, activeTab]);

  const handleCreateCst = useCallback(
  (data: ICstCreateData) => {
    if (!schema?.items) {
      return;
    }
    data.alias = createAliasFor(data.cst_type, schema);
    cstCreate(data, newCst => {
      toast.success(`Конституента добавлена: ${newCst.alias}`);
      navigateTo(activeTab, newCst.id);    
      if (activeTab === RSTabsList.CST_EDIT || activeTab == RSTabsList.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          }
        }, TIMEOUT_UI_REFRESH);
      }
    });
  }, [schema, cstCreate, navigateTo, activeTab]);

  const promptCreateCst = useCallback(
  (initialData: ICstCreateData, skipDialog?: boolean) => {
    if (skipDialog) {
      handleCreateCst(initialData);
    } else {
      setCreateInitialData(initialData);
      setShowCreateCst(true);
    }
  }, [handleCreateCst]);

  const handleDeleteCst = useCallback(
  (deleted: number[]) => {
    if (!schema) {
      return;
    }
    const data = {
      items: deleted.map(id => { return { id: id }; })
    };
    let activeIndex = schema.items.findIndex(cst => cst.id === activeID);
    cstDelete(data, () => {
      const deletedNames = deleted.map(id => schema.items.find(cst => cst.id === id)?.alias).join(', ');
      toast.success(`Конституенты удалены: ${deletedNames}`);
      if (deleted.length === schema.items.length) {
        navigateTo(RSTabsList.CST_LIST);
      }
      if (activeIndex) {
        while (activeIndex < schema.items.length && deleted.find(id => id === schema.items[activeIndex].id)) {
          ++activeIndex;
        }
        navigateTo(activeTab, schema.items[activeIndex].id);
      }
      if (afterDelete) afterDelete(deleted);
    });
  }, [afterDelete, cstDelete, schema, activeID, activeTab, navigateTo]);

  const promptDeleteCst = useCallback(
  (selected: number[], callback?: (items: number[]) => void) => {
    setAfterDelete(() => (
    (items: number[]) => {
      if (callback) callback(items);
    }));
    setToBeDeleted(selected);
    setShowDeleteCst(true)
  }, []);

  const onShowAST = useCallback(
  (expression: string, ast: SyntaxTree) => {
    setSyntaxTree(ast);
    setExpression(expression);
    setShowAST(true);
  }, []);

  const onOpenCst = useCallback(
  (cstID: number) => {
    navigateTo(RSTabsList.CST_EDIT, cstID)
  }, [navigateTo]);

  const onDestroySchema = useCallback(
  () => {
    if (!schema || !window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      return;
    }
    destroySchema(schema.id, () => {
      toast.success('Схема удалена');
      navigate('/library?filter=personal');
    });
  }, [schema, destroySchema, navigate]);

  return (
  <div className='w-full'>
    { loading && <Loader /> }
    { error && <BackendError error={error} />}
    { schema && !loading && <>
    {showUpload && 
    <DlgUploadRSForm
      hideWindow={() => setShowUpload(false)}
    />}
    {showClone &&
    <DlgCloneRSForm
      hideWindow={() => setShowClone(false)}
    />}
    {showAST && 
    <DlgShowAST
      expression={expression}
      syntaxTree={syntaxTree}
      hideWindow={() => setShowAST(false)}
    />}
    {showCreateCst && 
    <DlgCreateCst
      hideWindow={() => setShowCreateCst(false)}
      onCreate={handleCreateCst}
      initial={createInitialData}
    />}
    {showDeleteCst && 
    <DlgDeleteCst
      hideWindow={() => setShowDeleteCst(false)}
      onDelete={handleDeleteCst}
      selected={toBeDeleted}
    />}
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus={true}
      selectedTabClassName='font-bold'
    >
      <TabList className='flex items-start select-none w-fit clr-bg-pop'>
        <RSTabsMenu 
          onDestroy={onDestroySchema}
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
        <EditorRSForm 
          onDestroy={onDestroySchema}
        />
        {schema.stats && <RSFormStats stats={schema.stats}/>}
      </TabPanel>

      <TabPanel className='w-full'>
        <EditorItems
          onOpenEdit={onOpenCst}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
        />
      </TabPanel>

      <TabPanel>
        <EditorConstituenta 
          activeID={activeID}
          onOpenEdit={onOpenCst}
          onShowAST={onShowAST}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
        />
      </TabPanel>

      <TabPanel>
        <EditorTermGraph 
          onOpenEdit={onOpenCst}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
        />
      </TabPanel>
    </Tabs>
    </>}
  </div>);
}

export default RSTabs;
