'use client';

import axios from 'axios';
import fileDownload from 'js-file-download';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import ConceptTab from '@/components/Common/ConceptTab';
import TextURL from '@/components/Common/TextURL';
import InfoError, { ErrorData } from '@/components/InfoError';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { useRSForm } from '@/context/RSFormContext';
import { useConceptTheme } from '@/context/ThemeContext';
import DlgCloneLibraryItem from '@/dialogs/DlgCloneLibraryItem';
import DlgConstituentaTemplate from '@/dialogs/DlgConstituentaTemplate';
import DlgCreateCst from '@/dialogs/DlgCreateCst';
import DlgDeleteCst from '@/dialogs/DlgDeleteCst';
import DlgEditWordForms from '@/dialogs/DlgEditWordForms';
import DlgRenameCst from '@/dialogs/DlgRenameCst';
import DlgUploadRSForm from '@/dialogs/DlgUploadRSForm';
import useQueryStrings from '@/hooks/useQueryStrings';
import { IConstituenta, ICstCreateData, ICstRenameData, ICstUpdateData, TermForm } from '@/models/rsform';
import { EXTEOR_TRS_FILE, prefixes, TIMEOUT_UI_REFRESH } from '@/utils/constants';
import { createAliasFor } from '@/utils/misc';

import EditorConstituenta from './EditorConstituenta';
import EditorRSForm from './EditorRSForm';
import EditorRSList from './EditorRSList';
import EditorTermGraph from './EditorTermGraph';
import RSTabsMenu from './RSTabsMenu';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

function ProcessError({error}: {error: ErrorData}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
    return (
      <div className='flex flex-col items-center justify-center w-full p-2'>
        <p>Схема с указанным идентификатором отсутствует на портале.</p>
        <TextURL text='Перейти в Библиотеку' href='/library'/>
      </div>
    );
  } else {
    return (<InfoError error={error} />);
  }
}

function RSTabs() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const tabQuery = (Number(query.get('tab')) ?? RSTabID.CARD) as RSTabID;
  const cstQuery = query.get('active');

  const { 
    error, schema, loading, claim, download, isTracking,
    cstCreate, cstDelete, cstRename, subscribe, unsubscribe, cstUpdate
  } = useRSForm();
  const { destroyItem } = useLibrary();
  const { setNoFooter, noNavigation } = useConceptTheme();

  const [isModified, setIsModified] = useState(false);

  const [activeTab, setActiveTab] = useState(RSTabID.CARD);
  const [activeID, setActiveID] = useState<number | undefined>(undefined);
  const activeCst = useMemo(
    () => schema?.items?.find(cst => cst.id === activeID)
  , [schema?.items, activeID]);
  
  const [showUpload, setShowUpload] = useState(false);
  const [showClone, setShowClone] = useState(false);
  
  const [afterDelete, setAfterDelete] = useState<((items: number[]) => void) | undefined>(undefined);
  const [toBeDeleted, setToBeDeleted] = useState<number[]>([]);
  const [showDeleteCst, setShowDeleteCst] = useState(false);
  
  const [createInitialData, setCreateInitialData] = useState<ICstCreateData>();
  const [showCreateCst, setShowCreateCst] = useState(false);
  
  const [renameInitialData, setRenameInitialData] = useState<ICstRenameData>();
  const [showRenameCst, setShowRenameCst] = useState(false);

  const [showEditTerm, setShowEditTerm] = useState(false);
  
  const [insertCstID, setInsertCstID] = useState<number | undefined>(undefined);
  const [showTemplates, setShowTemplates] = useState(false);

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
    setActiveTab(tabQuery);
    setNoFooter(tabQuery === RSTabID.CST_EDIT || tabQuery === RSTabID.CST_LIST);
    setActiveID(Number(cstQuery) ?? ((schema && schema?.items.length > 0) ? schema.items[0].id : undefined));
    setIsModified(false);
    return () => setNoFooter(false);
  }, [tabQuery, cstQuery, setActiveTab, setActiveID, schema, setNoFooter, setIsModified]);

  function onSelectTab(index: number) {
    navigateTab(index, activeID);
  }

  const navigateTab = useCallback(
  (tab: RSTabID, activeID?: number) => {
    if (!schema) {
      return;
    }
    if (activeID) {
      if (tab === activeTab && tab !== RSTabID.CST_EDIT) {
        router.replace(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
      } else {
        router.push(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
      }
    } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
      activeID = schema.items[0].id;
      router.replace(`/rsforms/${schema.id}?tab=${tab}&active=${activeID}`);
    } else {
      router.push(`/rsforms/${schema.id}?tab=${tab}`);
    }
  }, [router, schema, activeTab]);

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

    const deletedNames = deleted.map(id => schema.items.find(cst => cst.id === id)?.alias).join(', ');
    const isEmpty = deleted.length === schema.items.length;
    const nextActive = isEmpty ? undefined : getNextActiveOnDelete(activeID, schema.items, deleted);
    
    cstDelete(data, () => {
      toast.success(`Конституенты удалены: ${deletedNames}`);
      if (isEmpty) {
        navigateTab(RSTabID.CST_LIST);
      } else if (!nextActive) {
        navigateTab(activeTab);
      } else {
        navigateTab(activeTab, nextActive);
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

  const onOpenCst = useCallback(
  (cstID: number) => {
    navigateTab(RSTabID.CST_EDIT, cstID)
  }, [navigateTab]);

  const onDestroySchema = useCallback(
  () => {
    if (!schema || !window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      return;
    }
    destroyItem(schema.id, () => {
      toast.success('Схема удалена');
      router.push('/library');
    });
  }, [schema, destroyItem, router]);

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

  const onShowTemplates = useCallback(
  (selectedID?: number) => {
    setInsertCstID(selectedID);
    setShowTemplates(true);
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

  return (<>
  {loading ? <ConceptLoader /> : null}
  {error ? <ProcessError error={error} /> : null}

  {showUpload ? 
  <DlgUploadRSForm
    hideWindow={() => setShowUpload(false)}
  /> : null}
  {showClone ?
  <DlgCloneLibraryItem
    base={schema!}
    hideWindow={() => setShowClone(false)}
  /> : null}
  {showCreateCst ? 
  <DlgCreateCst
    hideWindow={() => setShowCreateCst(false)}
    onCreate={handleCreateCst}
    schema={schema!}
    initial={createInitialData}
  /> : null}
  {showRenameCst ? 
  <DlgRenameCst
    hideWindow={() => setShowRenameCst(false)}
    onRename={handleRenameCst}
    initial={renameInitialData!}
  /> : null}
  {showDeleteCst ? 
  <DlgDeleteCst
    schema={schema!}
    hideWindow={() => setShowDeleteCst(false)}
    onDelete={handleDeleteCst}
    selected={toBeDeleted}
  /> : null}
  {showEditTerm ?
  <DlgEditWordForms
    hideWindow={() => setShowEditTerm(false)}
    onSave={handleSaveWordforms}
    target={activeCst!}
  /> : null}
  {showTemplates ? 
  <DlgConstituentaTemplate
    schema={schema!}
    hideWindow={() => setShowTemplates(false)}
    insertAfter={insertCstID}
    onCreate={handleCreateCst}
  /> : null}

  {(schema && !loading) ?
  <Tabs
    selectedIndex={activeTab}
    onSelect={onSelectTab}
    defaultFocus
    selectedTabClassName='clr-selected'
    className='flex flex-col w-full'
  >
    <div className='flex justify-center w-[100vw]'>
    <TabList className='flex border-b-2 border-x-2 justify-stretch w-fit h-[1.9rem]'>
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
        label='Карточка'
        className='border-x-2'
        tooltip={`Название схемы: ${schema.title ?? ''}`}
      />
      <ConceptTab
        label='Содержание'
        className='border-r-2'
        tooltip={`Всего конституент: ${schema.stats?.count_all ?? 0}\nКоличество ошибок: ${schema.stats?.count_errors ?? 0}`}
      />
      <ConceptTab
        label='Редактор'
        className='border-r-2'
      />
      <ConceptTab
        label='Граф термов'
      />
    </TabList>
    </div>

    <div className='overflow-y-auto min-w-[48rem] w-[100vw] flex justify-center' style={{ maxHeight: panelHeight}}>
      <TabPanel forceRender style={{ display: activeTab === RSTabID.CARD ? '': 'none' }}>
        <EditorRSForm
          isModified={isModified}
          setIsModified={setIsModified}
          onDownload={onDownloadSchema}
          onDestroy={onDestroySchema}
          onClaim={onClaimSchema}
          onShare={onShareSchema}
        />
      </TabPanel>

      <TabPanel forceRender style={{ display: activeTab === RSTabID.CST_LIST ? '': 'none' }}>
        <EditorRSList
          onOpenEdit={onOpenCst}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
          onTemplates={onShowTemplates}
        />
      </TabPanel>

      <TabPanel forceRender style={{ display: activeTab === RSTabID.CST_EDIT ? '': 'none' }}>
        <EditorConstituenta
          isModified={isModified}
          setIsModified={setIsModified}
          activeID={activeID}
          activeCst={activeCst}
          onOpenEdit={onOpenCst}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
          onRenameCst={promptRenameCst}
          onEditTerm={promptShowEditTerm}
          onTemplates={onShowTemplates}
        />
      </TabPanel>

      <TabPanel style={{ display: activeTab === RSTabID.TERM_GRAPH ? '': 'none' }}>
        <EditorTermGraph 
          onOpenEdit={onOpenCst}
          onCreateCst={promptCreateCst}
          onDeleteCst={promptDeleteCst}
        />
      </TabPanel>
    </div>
  </Tabs> : null}
  </>);
}

export default RSTabs;

// ====== Internals =========
function getNextActiveOnDelete(activeID: number | undefined, items: IConstituenta[], deleted: number[]): number | undefined {
  if (items.length === deleted.length) {
    return undefined;
  }

  let activeIndex = items.findIndex(cst => cst.id === activeID);
  if (activeIndex === -1) {
    return undefined;
  }

  while (
    activeIndex < items.length &&
    deleted.find(id => id === items[activeIndex].id)
  ) {
    ++activeIndex;
  }
  if (activeIndex >= items.length) {
    activeIndex = items.length - 1;
    while (activeIndex >= 0 && deleted.find(id => id === items[activeIndex].id)) {
      --activeIndex;
    }
  }
  return items[activeIndex].id;
}