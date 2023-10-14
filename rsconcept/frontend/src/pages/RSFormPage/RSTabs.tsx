import axios from 'axios';
import fileDownload from 'js-file-download';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import BackendError, { ErrorInfo } from '../../components/BackendError';
import { ConceptLoader } from '../../components/Common/ConceptLoader';
import ConceptTab from '../../components/Common/ConceptTab';
import TextURL from '../../components/Common/TextURL';
import { useLibrary } from '../../context/LibraryContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useModificationPrompt from '../../hooks/useModificationPrompt';
import { ICstCreateData, ICstRenameData, ICstUpdateData, TermForm } from '../../models/rsform';
import { SyntaxTree } from '../../models/rslang';
import { EXTEOR_TRS_FILE, prefixes, TIMEOUT_UI_REFRESH } from '../../utils/constants';
import { createAliasFor } from '../../utils/misc';
import DlgCloneRSForm from './DlgCloneRSForm';
import DlgCreateCst from './DlgCreateCst';
import DlgDeleteCst from './DlgDeleteCst';
import DlgEditWordForms from './DlgEditWordForms';
import DlgRenameCst from './DlgRenameCst';
import DlgShowAST from './DlgShowAST';
import DlgUploadRSForm from './DlgUploadRSForm';
import EditorConstituenta from './EditorConstituenta';
import EditorItems from './EditorItems';
import EditorRSForm from './EditorRSForm';
import EditorTermGraph from './EditorTermGraph';
import RSFormStats from './elements/RSFormStats';
import RSTabsMenu from './RSTabsMenu';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

function ProcessError({error}: {error: ErrorInfo}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
    return (
      <div className='flex flex-col items-center justify-center w-full p-2'>
        <p>Схема с указанным идентификатором отсутствует на портале.</p>
        <TextURL text='Перейти в Библиотеку' href='/library'/>
      </div>
    );
  } else {
    return ( <BackendError error={error} />);
  }
}

function RSTabs() {
  const { navigateTo } = useConceptNavigation();
  const search = useLocation().search;
  const { 
    error, schema, loading, claim, download, isTracking,
    cstCreate, cstDelete, cstRename, subscribe, unsubscribe, cstUpdate
  } = useRSForm();
  const { destroySchema } = useLibrary();
  const { setNoFooter, noNavigation } = useConceptTheme();

  const { isModified, setIsModified } = useModificationPrompt();

  const [activeTab, setActiveTab] = useState<RSTabID>(RSTabID.CARD);
  const [activeID, setActiveID] = useState<number | undefined>(undefined);
  const activeCst = useMemo(
    () => schema?.items?.find(cst => cst.id === activeID)
  , [schema?.items, activeID]);
  
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
  
  const [renameInitialData, setRenameInitialData] = useState<ICstRenameData>();
  const [showRenameCst, setShowRenameCst] = useState(false);

  const [showEditTerm, setShowEditTerm] = useState(false);

  const panelHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 4.8rem - 4px)'
    : 'calc(100vh - 2rem - 4px)';
  }, [noNavigation]);

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
    const activeTab = (Number(new URLSearchParams(search).get('tab')) ?? RSTabID.CARD) as RSTabID;
    const cstQuery = new URLSearchParams(search).get('active');
    setActiveTab(activeTab);
    setNoFooter(activeTab === RSTabID.CST_EDIT || activeTab === RSTabID.CST_LIST);
    setActiveID(Number(cstQuery) ?? ((schema && schema?.items.length > 0) ? schema.items[0].id : undefined));
    return () => setNoFooter(false);
  }, [search, setActiveTab, setActiveID, schema, setNoFooter]);

  function onSelectTab(index: number) {
    navigateTab(index, activeID);
  }

  const navigateTab = useCallback(
  (tab: RSTabID, activeID?: number) => {
    if (!schema) {
      return;
    }
    if (activeID) {
      navigateTo(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`, {
        replace: tab === activeTab && tab !== RSTabID.CST_EDIT
      });
    } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
      activeID = schema.items[0].id;
      navigateTo(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`, { replace: true });
    } else {
      navigateTo(`/rsforms/${schema.id}?tab=${tab}`);
    }
  }, [navigateTo, schema, activeTab]);

  const handleCreateCst = useCallback(
  (data: ICstCreateData) => {
    if (!schema?.items) {
      return;
    }
    data.alias = data.alias || createAliasFor(data.cst_type, schema);
    cstCreate(data, newCst => {
      toast.success(`Конституента добавлена: ${newCst.alias}`);
      navigateTab(activeTab, newCst.id);    
      if (activeTab === RSTabID.CST_EDIT || activeTab === RSTabID.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest'
            });
          }
        }, TIMEOUT_UI_REFRESH);
      }
    });
  }, [schema, cstCreate, navigateTab, activeTab]);

  const promptCreateCst = useCallback(
  (initialData: ICstCreateData, skipDialog?: boolean) => {
    if (skipDialog) {
      handleCreateCst(initialData);
    } else {
      setCreateInitialData(initialData);
      setShowCreateCst(true);
    }
  }, [handleCreateCst]);

  const handleRenameCst = useCallback(
  (data: ICstRenameData) => {
    cstRename(data, () => toast.success(`Переименование: ${renameInitialData!.alias} -> ${data.alias}`));
  }, [cstRename, renameInitialData]);

  const promptRenameCst = useCallback(
  (initialData: ICstRenameData) => {
    setRenameInitialData(initialData);
    setShowRenameCst(true);
  }, []);

  const handleDeleteCst = useCallback(
  (deleted: number[]) => {
    if (!schema) {
      return;
    }
    const data = {
      items: deleted
    };
    let activeIndex = schema.items.findIndex(cst => cst.id === activeID);
    cstDelete(data, () => {
      const deletedNames = deleted.map(id => schema.items.find(cst => cst.id === id)?.alias).join(', ');
      toast.success(`Конституенты удалены: ${deletedNames}`);
      if (deleted.length === schema.items.length) {
        navigateTab(RSTabID.CST_LIST);
      }
      if (activeIndex) {
        while (activeIndex < schema.items.length && deleted.find(id => id === schema.items[activeIndex].id)) {
          ++activeIndex;
        }
        if (activeIndex >= schema.items.length) {
          activeIndex = schema.items.length - 1;
          while (activeIndex >= 0 && deleted.find(id => id === schema.items[activeIndex].id)) {
            --activeIndex;
          }
        }
        navigateTab(activeTab, schema.items[activeIndex].id);
      }
      if (afterDelete) afterDelete(deleted);
    });
  }, [afterDelete, cstDelete, schema, activeID, activeTab, navigateTab]);

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
    navigateTab(RSTabID.CST_EDIT, cstID)
  }, [navigateTab]);

  const onDestroySchema = useCallback(
  () => {
    if (!schema || !window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      return;
    }
    destroySchema(schema.id, () => {
      toast.success('Схема удалена');
      navigateTo('/library');
    });
  }, [schema, destroySchema, navigateTo]);

  const onClaimSchema = useCallback(
  () => {
    if (!window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
      return;
    }
    claim(() => toast.success('Вы стали владельцем схемы'));
  }, [claim]);

  const onShareSchema = useCallback(
  () => {
    const url = window.location.href + '&share';
    navigator.clipboard.writeText(url)
    .then(() => toast.success(`Ссылка скопирована: ${url}`))
    .catch(console.error);
  }, []);

  const onDownloadSchema = useCallback(
  () => {
    if (isModified) {
      if (!window.confirm('Присутствуют несохраненные изменения. Продолжить без их учета?')) {
        return;
      }
    }
    const fileName = (schema?.alias ?? 'Schema') +  EXTEOR_TRS_FILE;
    download(
    (data: Blob) => {
      try {
        fileDownload(data, fileName);
      } catch (error) {
        console.error(error);
      }
    });
  }, [schema?.alias, download, isModified]);

  const promptClone = useCallback(
  () => {
    if (isModified) {
      if (!window.confirm('Присутствуют несохраненные изменения. Продолжить без их учета?')) {
        return;
      }
    }
    setShowClone(true);
  }, [isModified]);

  const handleToggleSubscribe = useCallback(
  () => {
    if (isTracking) {
      unsubscribe(() => toast.success('Отслеживание отключено'));
    } else {
      subscribe(() => toast.success('Отслеживание включено'));
    }
  }, [isTracking, subscribe, unsubscribe]);

  const promptShowEditTerm = useCallback(
  () => {
    if (!activeCst) {
      return;
    }
    if (isModified) {
      if (!window.confirm('Присутствуют несохраненные изменения. Продолжить без их учета?')) {
        return;
      }
    }
    setShowEditTerm(true);
  }, [isModified, activeCst]);

  const handleSaveWordforms = useCallback(
  (forms: TermForm[]) => {
    if (!activeID) {
      return;
    }
    const data: ICstUpdateData = {
      id: activeID,
      term_forms: forms
    };
    cstUpdate(data, () => toast.success('Изменения сохранены'));
  }, [cstUpdate, activeID]);

  return (
  <div className='w-full'>
    { loading && <ConceptLoader /> }
    { error && <ProcessError error={error} />}
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
      schema={schema}
      initial={createInitialData}
    />}
    {showRenameCst && 
    <DlgRenameCst
      hideWindow={() => setShowRenameCst(false)}
      onRename={handleRenameCst}
      initial={renameInitialData}
    />}
    {showDeleteCst && 
    <DlgDeleteCst
      hideWindow={() => setShowDeleteCst(false)}
      onDelete={handleDeleteCst}
      selected={toBeDeleted}
    />}
    {showEditTerm &&
    <DlgEditWordForms
      hideWindow={() => setShowEditTerm(false)}
      onSave={handleSaveWordforms}
      target={activeCst!}
    />}
    <Tabs
      selectedIndex={activeTab}
      onSelect={onSelectTab}
      defaultFocus={true}
      selectedTabClassName='clr-selected'
      className='flex flex-col w-full items-center'
    >
      <TabList className='flex items-start border-b-2 border-x-2 select-none justify-stretch w-fit clr-controls h-[1.9rem] small-caps font-semibold'>
        <RSTabsMenu 
          onDownload={onDownloadSchema}
          onDestroy={onDestroySchema}
          onClaim={onClaimSchema}
          onShare={onShareSchema}
          onToggleSubscribe={handleToggleSubscribe}
          showCloneDialog={promptClone} 
          showUploadDialog={() => setShowUpload(true)}
        />
        <ConceptTab 
          className='border-x-2 min-w-[7.8rem]'
          title={`Название схемы: ${schema.title ?? ''}`}
        >
          Паспорт схемы
        </ConceptTab>
        <ConceptTab 
          className='border-r-2 w-fit flex justify-between gap-2'
          title={`Всего конституент: ${schema.stats?.count_all ?? 0}\nКоличество ошибок: ${schema.stats?.count_errors ?? 0}`}
        >
          <span>Конституенты</span>
          <span>{`${schema.stats?.count_errors ?? 0} | ${schema.stats?.count_all ?? 0}`}</span>
        </ConceptTab>
        <ConceptTab className='border-r-2 min-w-[5.2rem]'>
          Редактор
        </ConceptTab>
        <ConceptTab className='min-w-[6.5rem]'>
          Граф термов
        </ConceptTab>
      </TabList>

      <div className='overflow-y-auto' style={{ maxHeight: panelHeight}}>
        <TabPanel className='flex gap-4 w-fit'>
          <EditorRSForm
            isModified={isModified}
            setIsModified={setIsModified}
            onDownload={onDownloadSchema}
            onDestroy={onDestroySchema}
            onClaim={onClaimSchema}
            onShare={onShareSchema}
          />
          {schema.stats && <RSFormStats stats={schema.stats}/>}
        </TabPanel>

        <TabPanel>
          <EditorItems
            onOpenEdit={onOpenCst}
            onCreateCst={promptCreateCst}
            onDeleteCst={promptDeleteCst}
          />
        </TabPanel>

        <TabPanel>
          <EditorConstituenta
            isModified={isModified}
            setIsModified={setIsModified}
            activeID={activeID}
            activeCst={activeCst}
            onOpenEdit={onOpenCst}
            onShowAST={onShowAST}
            onCreateCst={promptCreateCst}
            onDeleteCst={promptDeleteCst}
            onRenameCst={promptRenameCst}
            onEditTerm={promptShowEditTerm}
          />
        </TabPanel>

        <TabPanel>
          <EditorTermGraph 
            onOpenEdit={onOpenCst}
            onCreateCst={promptCreateCst}
            onDeleteCst={promptDeleteCst}
          />
        </TabPanel>
      </div>
    </Tabs>
    </>}
  </div>);
}

export default RSTabs;
