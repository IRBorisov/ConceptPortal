'use client';

import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import fileDownload from 'js-file-download';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import InfoError, { ErrorData } from '@/components/InfoError';
import Divider from '@/components/ui/Divider';
import Loader from '@/components/ui/Loader';
import TextURL from '@/components/ui/TextURL';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import DlgCloneLibraryItem from '@/dialogs/DlgCloneLibraryItem';
import DlgConstituentaTemplate from '@/dialogs/DlgConstituentaTemplate';
import DlgCreateCst from '@/dialogs/DlgCreateCst';
import DlgCreateVersion from '@/dialogs/DlgCreateVersion';
import DlgDeleteCst from '@/dialogs/DlgDeleteCst';
import DlgEditVersions from '@/dialogs/DlgEditVersions';
import DlgEditWordForms from '@/dialogs/DlgEditWordForms';
import DlgRenameCst from '@/dialogs/DlgRenameCst';
import DlgSubstituteCst from '@/dialogs/DlgSubstituteCst';
import DlgUploadRSForm from '@/dialogs/DlgUploadRSForm';
import { IVersionData } from '@/models/library';
import { UserAccessMode } from '@/models/miscellaneous';
import {
  CstType,
  EntityID,
  IConstituenta,
  IConstituentaMeta,
  ICstCreateData,
  ICstID,
  ICstMovetoData,
  ICstRenameData,
  ICstSubstituteData,
  ICstUpdateData,
  IRSForm,
  TermForm
} from '@/models/rsform';
import { generateAlias } from '@/models/rsformAPI';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

interface IRSEditContext {
  schema?: IRSForm;
  isMutable: boolean;
  isContentEditable: boolean;
  isProcessing: boolean;
  canProduceStructure: boolean;

  viewVersion: (version?: number) => void;

  moveUp: () => void;
  moveDown: () => void;
  createCst: (type: CstType | undefined, skipDialog: boolean, definition?: string) => void;
  renameCst: () => void;
  cloneCst: () => void;
  deleteCst: () => void;
  editTermForms: () => void;

  promptTemplate: () => void;
  promptClone: () => void;
  promptUpload: () => void;
  claim: () => void;
  share: () => void;
  toggleSubscribe: () => void;
  download: () => void;
  reindex: () => void;
  produceStructure: () => void;
  substitute: () => void;

  createVersion: () => void;
  editVersions: () => void;
}

const RSEditContext = createContext<IRSEditContext | null>(null);
export const useRSEdit = () => {
  const context = useContext(RSEditContext);
  if (context === null) {
    throw new Error('useRSEdit has to be used within <RSEditState.Provider>');
  }
  return context;
};

interface RSEditStateProps {
  selected: EntityID[];
  isModified: boolean;
  setSelected: React.Dispatch<React.SetStateAction<EntityID[]>>;
  activeCst?: IConstituenta;

  onCreateCst?: (newCst: IConstituentaMeta) => void;
  onDeleteCst?: (newActive?: EntityID) => void;
  children: React.ReactNode;
}

export const RSEditState = ({
  selected,
  setSelected,
  activeCst,
  isModified,
  onCreateCst,
  onDeleteCst,
  children
}: RSEditStateProps) => {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { mode, setMode } = useAccessMode();
  const model = useRSForm();

  const isMutable = useMemo(() => {
    return (
      !model.loading &&
      !model.processing &&
      mode !== UserAccessMode.READER &&
      ((model.isOwned || (mode === UserAccessMode.ADMIN && user?.is_staff)) ?? false)
    );
  }, [user?.is_staff, mode, model.isOwned, model.loading, model.processing]);

  const isContentEditable = useMemo(() => isMutable && !model.isArchive, [isMutable, model.isArchive]);

  const [showUpload, setShowUpload] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showDeleteCst, setShowDeleteCst] = useState(false);
  const [showEditTerm, setShowEditTerm] = useState(false);
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showEditVersions, setShowEditVersions] = useState(false);

  const [createInitialData, setCreateInitialData] = useState<ICstCreateData>();
  const [showCreateCst, setShowCreateCst] = useState(false);

  const [renameInitialData, setRenameInitialData] = useState<ICstRenameData>();
  const [showRenameCst, setShowRenameCst] = useState(false);

  const [insertCstID, setInsertCstID] = useState<EntityID | undefined>(undefined);
  const [showTemplates, setShowTemplates] = useState(false);

  useLayoutEffect(
    () =>
      setMode(prev => {
        if (prev === UserAccessMode.ADMIN) {
          return prev;
        } else if (model.isOwned) {
          return UserAccessMode.OWNER;
        } else {
          return UserAccessMode.READER;
        }
      }),
    [model.schema, setMode, model.isOwned]
  );

  const viewVersion = useCallback(
    (version?: number) => {
      if (version) {
        router.push(`/rsforms/${model.schemaID}?v=${version}`);
      } else {
        router.push(`/rsforms/${model.schemaID}`);
      }
    },
    [router, model]
  );

  const handleCreateCst = useCallback(
    (data: ICstCreateData) => {
      if (!model.schema) {
        return;
      }
      data.alias = data.alias || generateAlias(data.cst_type, model.schema);
      model.cstCreate(data, newCst => {
        toast.success(`Конституента добавлена: ${newCst.alias}`);
        setSelected([newCst.id]);
        if (onCreateCst) onCreateCst(newCst);
      });
    },
    [model, setSelected, onCreateCst]
  );

  const handleRenameCst = useCallback(
    (data: ICstRenameData) => {
      model.cstRename(data, () => toast.success(`Переименование: ${renameInitialData!.alias} -> ${data.alias}`));
    },
    [model, renameInitialData]
  );

  const handleSubstituteCst = useCallback(
    (data: ICstSubstituteData) => {
      model.cstSubstitute(data, () => toast.success('Отождествление завершено'));
    },
    [model]
  );

  const handleDeleteCst = useCallback(
    (deleted: EntityID[]) => {
      if (!model.schema) {
        return;
      }
      const data = {
        items: deleted
      };

      const deletedNames = deleted.map(id => model.schema?.items.find(cst => cst.id === id)?.alias).join(', ');
      const isEmpty = deleted.length === model.schema.items.length;
      const nextActive = isEmpty ? undefined : getNextActiveOnDelete(activeCst?.id, model.schema.items, deleted);

      model.cstDelete(data, () => {
        toast.success(`Конституенты удалены: ${deletedNames}`);
        setSelected(nextActive ? [nextActive] : []);
        if (onDeleteCst) onDeleteCst(nextActive);
      });
    },
    [model, activeCst, onDeleteCst, setSelected]
  );

  const handleSaveWordforms = useCallback(
    (forms: TermForm[]) => {
      if (!activeCst) {
        return;
      }
      const data: ICstUpdateData = {
        id: activeCst.id,
        term_forms: forms
      };
      model.cstUpdate(data, () => toast.success('Изменения сохранены'));
    },
    [model, activeCst]
  );

  const handleCreateVersion = useCallback(
    (data: IVersionData) => {
      if (!model.schema) {
        return;
      }
      model.versionCreate(data, newVersion => {
        toast.success('Версия создана');
        viewVersion(newVersion);
      });
    },
    [model, viewVersion]
  );

  const handleDeleteVersion = useCallback(
    (versionID: number) => {
      if (!model.schema) {
        return;
      }
      model.versionDelete(versionID, () => toast.success('Версия удалена'));
    },
    [model]
  );

  const handleUpdateVersion = useCallback(
    (versionID: number, data: IVersionData) => {
      if (!model.schema) {
        return;
      }
      model.versionUpdate(versionID, data, () => toast.success('Версия обновлена'));
    },
    [model]
  );

  const moveUp = useCallback(() => {
    if (!model.schema?.items || selected.length === 0) {
      return;
    }
    const currentIndex = model.schema.items.reduce((prev, cst, index) => {
      if (!selected.includes(cst.id)) {
        return prev;
      } else if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1) + 1;
    const data = {
      items: selected,
      move_to: target
    };
    model.cstMoveTo(data);
  }, [model, selected]);

  const moveDown = useCallback(() => {
    if (!model.schema?.items || selected.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = model.schema.items.reduce((prev, cst, index) => {
      if (!selected.includes(cst.id)) {
        return prev;
      } else {
        count += 1;
        if (prev === -1) {
          return index;
        }
        return Math.max(prev, index);
      }
    }, -1);
    const target = Math.min(model.schema.items.length - 1, currentIndex - count + 2) + 1;
    const data: ICstMovetoData = {
      items: selected,
      move_to: target
    };
    model.cstMoveTo(data);
  }, [model, selected]);

  const createCst = useCallback(
    (type: CstType | undefined, skipDialog: boolean, definition?: string) => {
      const data: ICstCreateData = {
        insert_after: activeCst?.id ?? null,
        cst_type: type ?? activeCst?.cst_type ?? CstType.BASE,
        alias: '',
        term_raw: '',
        definition_formal: definition ?? '',
        definition_raw: '',
        convention: '',
        term_forms: []
      };
      if (skipDialog) {
        handleCreateCst(data);
      } else {
        setCreateInitialData(data);
        setShowCreateCst(true);
      }
    },
    [activeCst, handleCreateCst]
  );

  const cloneCst = useCallback(() => {
    if (!activeCst) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: activeCst.id,
      cst_type: activeCst.cst_type,
      alias: '',
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      term_forms: activeCst.term_forms
    };
    handleCreateCst(data);
  }, [activeCst, handleCreateCst]);

  const renameCst = useCallback(() => {
    if (!activeCst) {
      return;
    }
    const data: ICstRenameData = {
      id: activeCst.id,
      alias: activeCst.alias,
      cst_type: activeCst.cst_type
    };
    setRenameInitialData(data);
    setShowRenameCst(true);
  }, [activeCst]);

  const substitute = useCallback(() => {
    setShowSubstitute(true);
  }, []);

  const editTermForms = useCallback(() => {
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

  const reindex = useCallback(() => model.resetAliases(() => toast.success('Имена конституент обновлены')), [model]);

  const canProduceStructure = useMemo(() => {
    return (
      !!activeCst &&
      !!activeCst.parse.typification &&
      activeCst.cst_type !== CstType.BASE &&
      activeCst.cst_type !== CstType.CONSTANT
    );
  }, [activeCst]);

  const produceStructure = useCallback(() => {
    if (!activeCst) {
      return;
    }
    const data: ICstID = {
      id: activeCst.id
    };
    model.produceStructure(data, cstList => {
      toast.success(`Добавлены конституенты: ${cstList.length}`);
      if (cstList.length !== 0) {
        setSelected(cstList);
      }
    });
  }, [activeCst, setSelected, model]);

  const promptTemplate = useCallback(() => {
    setInsertCstID(activeCst?.id);
    setShowTemplates(true);
  }, [activeCst]);

  const promptClone = useCallback(() => {
    if (isModified) {
      if (!window.confirm('Присутствуют несохраненные изменения. Продолжить без их учета?')) {
        return;
      }
    }
    setShowClone(true);
  }, [isModified]);

  const download = useCallback(() => {
    if (isModified) {
      if (!window.confirm('Присутствуют несохраненные изменения. Продолжить без их учета?')) {
        return;
      }
    }
    const fileName = (model.schema?.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    model.download((data: Blob) => {
      try {
        fileDownload(data, fileName);
      } catch (error) {
        console.error(error);
      }
    });
  }, [model, isModified]);

  const claim = useCallback(() => {
    if (!window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
      return;
    }
    model.claim(() => toast.success('Вы стали владельцем схемы'));
  }, [model]);

  const share = useCallback(() => {
    const currentRef = window.location.href;
    const url = currentRef.includes('?') ? currentRef + '&share' : currentRef + '?share';
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(`Ссылка скопирована: ${url}`))
      .catch(console.error);
  }, []);

  const toggleSubscribe = useCallback(() => {
    if (model.isSubscribed) {
      model.unsubscribe(() => toast.success('Отслеживание отключено'));
    } else {
      model.subscribe(() => toast.success('Отслеживание включено'));
    }
  }, [model]);

  return (
    <RSEditContext.Provider
      value={{
        schema: model.schema,
        isMutable,
        isContentEditable,
        isProcessing: model.processing,
        canProduceStructure,

        viewVersion,

        moveUp,
        moveDown,
        createCst,
        cloneCst,
        renameCst,
        deleteCst: () => setShowDeleteCst(true),
        editTermForms,

        promptTemplate,
        promptClone,
        promptUpload: () => setShowUpload(true),
        download,
        claim,
        share,
        toggleSubscribe,
        reindex,
        produceStructure,
        substitute,

        createVersion: () => setShowCreateVersion(true),
        editVersions: () => setShowEditVersions(true)
      }}
    >
      {model.schema ? (
        <AnimatePresence>
          {showUpload ? <DlgUploadRSForm hideWindow={() => setShowUpload(false)} /> : null}
          {showClone ? <DlgCloneLibraryItem base={model.schema} hideWindow={() => setShowClone(false)} /> : null}
          {showCreateCst ? (
            <DlgCreateCst
              hideWindow={() => setShowCreateCst(false)}
              onCreate={handleCreateCst}
              schema={model.schema}
              initial={createInitialData}
            />
          ) : null}
          {showRenameCst && renameInitialData ? (
            <DlgRenameCst
              hideWindow={() => setShowRenameCst(false)}
              onRename={handleRenameCst}
              initial={renameInitialData}
            />
          ) : null}
          {showSubstitute ? (
            <DlgSubstituteCst
              hideWindow={() => setShowSubstitute(false)} // prettier: split lines
              onSubstitute={handleSubstituteCst}
            />
          ) : null}
          {showDeleteCst ? (
            <DlgDeleteCst
              schema={model.schema}
              hideWindow={() => setShowDeleteCst(false)}
              onDelete={handleDeleteCst}
              selected={selected}
            />
          ) : null}
          {showEditTerm && activeCst ? (
            <DlgEditWordForms
              hideWindow={() => setShowEditTerm(false)}
              onSave={handleSaveWordforms}
              target={activeCst}
            />
          ) : null}
          {showTemplates ? (
            <DlgConstituentaTemplate
              schema={model.schema}
              hideWindow={() => setShowTemplates(false)}
              insertAfter={insertCstID}
              onCreate={handleCreateCst}
            />
          ) : null}
          {showCreateVersion ? (
            <DlgCreateVersion
              versions={model.schema.versions}
              hideWindow={() => setShowCreateVersion(false)}
              onCreate={handleCreateVersion}
            />
          ) : null}
          {showEditVersions ? (
            <DlgEditVersions
              versions={model.schema.versions}
              hideWindow={() => setShowEditVersions(false)}
              onDelete={handleDeleteVersion}
              onUpdate={handleUpdateVersion}
            />
          ) : null}
        </AnimatePresence>
      ) : null}

      {model.loading ? <Loader /> : null}
      {model.error ? <ProcessError error={model.error} isArchive={model.isArchive} schemaID={model.schemaID} /> : null}
      {model.schema && !model.loading ? children : null}
    </RSEditContext.Provider>
  );
};

// ====== Internals =========
function ProcessError({
  error,
  isArchive,
  schemaID
}: {
  error: ErrorData;
  isArchive: boolean;
  schemaID: string;
}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
    return (
      <div className='p-2 text-center'>
        <p>{`Схема с указанным идентификатором ${isArchive ? 'и версией ' : ''}отсутствует`}</p>
        <div className='flex justify-center'>
          <TextURL text='Библиотека' href='/library' />
          {isArchive ? <Divider vertical margins='mx-3' /> : null}
          {isArchive ? <TextURL text='Актуальная версия' href={`/rsforms/${schemaID}`} /> : null}
        </div>
      </div>
    );
  } else {
    return <InfoError error={error} />;
  }
}

function getNextActiveOnDelete(
  activeID: number | undefined,
  items: IConstituenta[],
  deleted: number[]
): number | undefined {
  if (items.length === deleted.length) {
    return undefined;
  }

  let activeIndex = items.findIndex(cst => cst.id === activeID);
  if (activeIndex === -1) {
    return undefined;
  }

  while (activeIndex < items.length && deleted.find(id => id === items[activeIndex].id)) {
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
