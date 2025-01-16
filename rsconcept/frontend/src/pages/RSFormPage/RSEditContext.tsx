'use client';

import fileDownload from 'js-file-download';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import {
  AccessPolicy,
  ILibraryItemEditor,
  ILibraryUpdateData,
  IVersionData,
  LibraryItemID,
  LocationHead,
  VersionID
} from '@/models/library';
import { ICstSubstituteData } from '@/models/oss';
import {
  ConstituentaID,
  CstType,
  IConstituenta,
  IConstituentaMeta,
  ICstCreateData,
  ICstMovetoData,
  ICstRenameData,
  ICstUpdateData,
  IInlineSynthesisData,
  IRSForm,
  ITargetCst,
  TermForm
} from '@/models/rsform';
import { generateAlias } from '@/models/rsformAPI';
import { UserID, UserRole } from '@/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { useRoleStore } from '@/stores/role';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { information, prompts } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { RSTabID } from './RSTabs';

export interface IRSEditContext extends ILibraryItemEditor {
  schema?: IRSForm;
  selected: ConstituentaID[];

  isMutable: boolean;
  isContentEditable: boolean;
  isProcessing: boolean;
  isAttachedToOSS: boolean;
  canProduceStructure: boolean;
  canDeleteSelected: boolean;

  updateSchema: (data: ILibraryUpdateData) => void;

  setOwner: (newOwner: UserID) => void;
  setAccessPolicy: (newPolicy: AccessPolicy) => void;
  promptEditors: () => void;
  promptLocation: () => void;

  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
  select: (target: ConstituentaID) => void;
  deselect: (target: ConstituentaID) => void;
  toggleSelect: (target: ConstituentaID) => void;
  deselectAll: () => void;

  viewOSS: (target: LibraryItemID, newTab?: boolean) => void;
  viewVersion: (version?: VersionID, newTab?: boolean) => void;
  viewPredecessor: (target: ConstituentaID) => void;
  createVersion: () => void;
  restoreVersion: () => void;
  promptEditVersions: () => void;

  moveUp: () => void;
  moveDown: () => void;
  createCst: (type: CstType | undefined, skipDialog: boolean, definition?: string) => void;
  renameCst: () => void;
  cloneCst: () => void;
  promptDeleteCst: () => void;
  editTermForms: () => void;

  promptTemplate: () => void;
  promptClone: () => void;
  promptUpload: () => void;
  share: () => void;
  download: () => void;

  reindex: () => void;
  reorder: () => void;
  produceStructure: () => void;
  inlineSynthesis: () => void;
  substitute: () => void;

  showTypeGraph: () => void;
  showQR: () => void;
}

const RSEditContext = createContext<IRSEditContext | null>(null);
export const useRSEdit = () => {
  const context = useContext(RSEditContext);
  if (context === null) {
    throw new Error('useRSEdit has to be used within <RSEditState>');
  }
  return context;
};

interface RSEditStateProps {
  selected: ConstituentaID[];
  isModified: boolean;
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
  activeCst?: IConstituenta;

  onCreateCst?: (newCst: IConstituentaMeta) => void;
  onDeleteCst?: (newActive?: ConstituentaID) => void;
}

export const RSEditState = ({
  selected,
  setSelected,
  activeCst,
  isModified,
  onCreateCst,
  onDeleteCst,
  children
}: React.PropsWithChildren<RSEditStateProps>) => {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const adjustRole = useRoleStore(state => state.adjustRole);
  const model = useRSForm();

  const isMutable = useMemo(() => role > UserRole.READER && !model.schema?.read_only, [role, model.schema?.read_only]);
  const isContentEditable = useMemo(() => isMutable && !model.isArchive, [isMutable, model.isArchive]);
  const canDeleteSelected = useMemo(
    () => selected.length > 0 && selected.every(id => !model.schema?.cstByID.get(id)?.is_inherited),
    [selected, model.schema]
  );
  const isAttachedToOSS = useMemo(
    () =>
      !!model.schema &&
      model.schema.oss.length > 0 &&
      (model.schema.stats.count_inherited > 0 || model.schema.items.length === 0),
    [model.schema]
  );

  const [renameInitialData, setRenameInitialData] = useState<ICstRenameData>();

  const showClone = useDialogsStore(state => state.showCloneLibraryItem);
  const showCreateVersion = useDialogsStore(state => state.showCreateVersion);
  const showEditVersions = useDialogsStore(state => state.showEditVersions);
  const showEditEditors = useDialogsStore(state => state.showEditEditors);
  const showEditLocation = useDialogsStore(state => state.showChangeLocation);

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);

  const showRenameCst = useDialogsStore(state => state.showRenameCst);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);

  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);
  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showUpload = useDialogsStore(state => state.showUploadRSForm);
  const showQR = useDialogsStore(state => state.showQR);

  const typeInfo = useMemo(
    () =>
      model.schema
        ? model.schema.items.map(item => ({
            alias: item.alias,
            result: item.parse.typification,
            args: item.parse.args
          }))
        : [],
    [model.schema]
  );

  useEffect(
    () =>
      adjustRole({
        isOwner: model.isOwned,
        isEditor: (user && model.schema?.editors.includes(user?.id)) ?? false,
        isStaff: user?.is_staff ?? false,
        adminMode: adminMode
      }),
    [model.schema, adjustRole, model.isOwned, user, adminMode]
  );

  const updateSchema = useCallback(
    (data: ILibraryUpdateData) => model.update(data, () => toast.success(information.changesSaved)),
    [model]
  );

  const viewVersion = useCallback(
    (version?: VersionID, newTab?: boolean) => router.push(urls.schema(model.itemID, version), newTab),
    [router, model]
  );

  const viewPredecessor = useCallback(
    (target: ConstituentaID) =>
      model.findPredecessor({ target: target }, reference =>
        router.push(
          urls.schema_props({
            id: reference.schema,
            active: reference.id,
            tab: RSTabID.CST_EDIT
          })
        )
      ),
    [router, model]
  );

  const viewOSS = useCallback(
    (target: LibraryItemID, newTab?: boolean) => router.push(urls.oss(target), newTab),
    [router]
  );

  const restoreVersion = useCallback(() => {
    if (!model.versionID || !window.confirm(prompts.restoreArchive)) {
      return;
    }
    model.versionRestore(model.versionID, () => {
      toast.success(information.versionRestored);
      viewVersion(undefined);
    });
  }, [model, viewVersion]);

  const calculateCloneLocation = useCallback(() => {
    if (!model.schema) {
      return LocationHead.USER;
    }
    const location = model.schema.location;
    const head = model.schema.location.substring(0, 2) as LocationHead;
    if (head === LocationHead.LIBRARY) {
      return user?.is_staff ? location : LocationHead.USER;
    }
    if (model.schema.owner === user?.id) {
      return location;
    }
    return head === LocationHead.USER ? LocationHead.USER : location;
  }, [model.schema, user]);

  const handleCreateCst = useCallback(
    (data: ICstCreateData) => {
      if (!model.schema) {
        return;
      }
      data.alias = data.alias || generateAlias(data.cst_type, model.schema);
      model.cstCreate(data, newCst => {
        toast.success(information.newConstituent(newCst.alias));
        setSelected([newCst.id]);
        if (onCreateCst) onCreateCst(newCst);
      });
    },
    [model, setSelected, onCreateCst]
  );

  const handleRenameCst = useCallback(
    (data: ICstRenameData) => {
      const oldAlias = renameInitialData?.alias ?? '';
      model.cstRename(data, () => toast.success(information.renameComplete(oldAlias, data.alias)));
    },
    [model, renameInitialData]
  );

  const handleSubstituteCst = useCallback(
    (data: ICstSubstituteData) => {
      model.cstSubstitute(data, () => {
        setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)));
        toast.success(information.substituteSingle);
      });
    },
    [model, setSelected]
  );

  const handleDeleteCst = useCallback(
    (deleted: ConstituentaID[]) => {
      if (!model.schema) {
        return;
      }
      const data = {
        items: deleted
      };

      const deletedNames = deleted.map(id => model.schema!.cstByID.get(id)!.alias).join(', ');
      const isEmpty = deleted.length === model.schema.items.length;
      const nextActive = isEmpty ? undefined : getNextActiveOnDelete(activeCst?.id, model.schema.items, deleted);

      model.cstDelete(data, () => {
        toast.success(information.constituentsDestroyed(deletedNames));
        setSelected(nextActive ? [nextActive] : []);
        onDeleteCst?.(nextActive);
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
        target: activeCst.id,
        item_data: { term_forms: forms }
      };
      model.cstUpdate(data, () => toast.success(information.changesSaved));
    },
    [model, activeCst]
  );

  const handleCreateVersion = useCallback(
    (data: IVersionData) => {
      if (!model.schema) {
        return;
      }
      model.versionCreate(data, () => {
        toast.success(information.newVersion(data.version));
      });
    },
    [model]
  );

  const handleDeleteVersion = useCallback(
    (versionID: VersionID) => {
      if (!model.schema) {
        return;
      }
      model.versionDelete(versionID, () => {
        toast.success(information.versionDestroyed);
        if (String(versionID) === model.versionID) {
          viewVersion(undefined);
        }
      });
    },
    [model, viewVersion]
  );

  const handleUpdateVersion = useCallback(
    (versionID: VersionID, data: IVersionData) => {
      if (!model.schema) {
        return;
      }
      model.versionUpdate(versionID, data, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const handleSetLocation = useCallback(
    (newLocation: string) => {
      if (!model.schema) {
        return;
      }
      model.setLocation(newLocation, () => toast.success(information.moveComplete));
    },
    [model]
  );

  const handleInlineSynthesis = useCallback(
    (data: IInlineSynthesisData) => {
      if (!model.schema) {
        return;
      }
      const oldCount = model.schema.items.length;
      model.inlineSynthesis(data, newSchema => {
        setSelected([]);
        toast.success(information.addedConstituents(newSchema.items.length - oldCount));
      });
    },
    [model, setSelected]
  );

  const createVersion = useCallback(() => {
    if (!model.schema || (isModified && !promptUnsaved())) {
      return;
    }
    showCreateVersion({
      versions: model.schema.versions,
      onCreate: handleCreateVersion,
      selected: selected,
      totalCount: model.schema.items.length
    });
  }, [isModified, model.schema, selected, handleCreateVersion, showCreateVersion]);

  const promptEditVersions = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showEditVersions({
      versions: model.schema.versions,
      onDelete: handleDeleteVersion,
      onUpdate: handleUpdateVersion
    });
  }, [model.schema, handleDeleteVersion, handleUpdateVersion, showEditVersions]);

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
    const target = Math.max(0, currentIndex - 1);
    const data: ICstMovetoData = {
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
    const target = Math.min(model.schema.items.length - 1, currentIndex - count + 2);
    const data: ICstMovetoData = {
      items: selected,
      move_to: target
    };
    model.cstMoveTo(data);
  }, [model, selected]);

  const createCst = useCallback(
    (type: CstType | undefined, skipDialog: boolean, definition?: string) => {
      if (!model.schema) {
        return;
      }
      const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
      const data: ICstCreateData = {
        insert_after: activeCst?.id ?? null,
        cst_type: targetType,
        alias: generateAlias(targetType, model.schema),
        term_raw: '',
        definition_formal: definition ?? '',
        definition_raw: '',
        convention: '',
        term_forms: []
      };
      if (skipDialog) {
        handleCreateCst(data);
      } else {
        showCreateCst({ schema: model.schema, onCreate: handleCreateCst, initial: data });
      }
    },
    [activeCst, handleCreateCst, model.schema, showCreateCst]
  );

  const cloneCst = useCallback(() => {
    if (!activeCst || !model.schema) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: activeCst.id,
      cst_type: activeCst.cst_type,
      alias: generateAlias(activeCst.cst_type, model.schema),
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      term_forms: activeCst.term_forms
    };
    handleCreateCst(data);
  }, [activeCst, handleCreateCst, model.schema]);

  const renameCst = useCallback(() => {
    if (!activeCst || !model.schema) {
      return;
    }
    const data: ICstRenameData = {
      target: activeCst.id,
      alias: activeCst.alias,
      cst_type: activeCst.cst_type
    };
    setRenameInitialData(data);
    showRenameCst({
      schema: model.schema,
      initial: data,
      allowChangeType: !activeCst.is_inherited,
      onRename: handleRenameCst
    });
  }, [activeCst, model.schema, handleRenameCst, showRenameCst]);

  const substitute = useCallback(() => {
    if (!model.schema || (isModified && !promptUnsaved())) {
      return;
    }
    showSubstituteCst({ schema: model.schema, onSubstitute: handleSubstituteCst });
  }, [isModified, model.schema, handleSubstituteCst, showSubstituteCst]);

  const inlineSynthesis = useCallback(() => {
    if (!model.schema || (isModified && !promptUnsaved())) {
      return;
    }
    showInlineSynthesis({ receiver: model.schema, onInlineSynthesis: handleInlineSynthesis });
  }, [isModified, model.schema, handleInlineSynthesis, showInlineSynthesis]);

  const promptDeleteCst = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showDeleteCst({ schema: model.schema, selected: selected, onDelete: handleDeleteCst });
  }, [model.schema, selected, handleDeleteCst, showDeleteCst]);

  const editTermForms = useCallback(() => {
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({ target: activeCst, onSave: handleSaveWordforms });
  }, [isModified, activeCst, handleSaveWordforms, showEditTerm]);

  const reindex = useCallback(() => model.resetAliases(() => toast.success(information.reindexComplete)), [model]);
  const reorder = useCallback(() => model.restoreOrder(() => toast.success(information.reorderComplete)), [model]);

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
    if (isModified && !promptUnsaved()) {
      return;
    }
    const data: ITargetCst = {
      target: activeCst.id
    };
    model.produceStructure(data, cstList => {
      toast.success(information.addedConstituents(cstList.length));
      if (cstList.length !== 0) {
        setSelected(cstList);
      }
    });
  }, [activeCst, setSelected, model, isModified]);

  const setEditors = useCallback(
    (newEditors: UserID[]) => {
      model.setEditors(newEditors, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const promptTemplate = useCallback(() => {
    if ((isModified && !promptUnsaved()) || !model.schema) {
      return;
    }
    showCstTemplate({ schema: model.schema, onCreate: handleCreateCst, insertAfter: activeCst?.id });
  }, [activeCst, isModified, handleCreateCst, model.schema, showCstTemplate]);

  const promptClone = useCallback(() => {
    if (!model.schema || (isModified && !promptUnsaved())) {
      return;
    }
    showClone({
      base: model.schema,
      initialLocation: calculateCloneLocation(),
      selected: selected,
      totalCount: model.schema.items.length
    });
  }, [isModified, model.schema, selected, showClone, calculateCloneLocation]);

  const promptEditors = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showEditEditors({ editors: model.schema.editors, setEditors: setEditors });
  }, [model.schema, showEditEditors, setEditors]);

  const promptLocation = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showEditLocation({ initial: model.schema.location, onChangeLocation: handleSetLocation });
  }, [model.schema, showEditLocation, handleSetLocation]);

  const download = useCallback(() => {
    if (isModified && !promptUnsaved()) {
      return;
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

  const share = useCallback(() => {
    const currentRef = window.location.href;
    const url = currentRef.includes('?') ? currentRef + '&share' : currentRef + '?share';
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(information.linkReady))
      .catch(console.error);
  }, []);

  const setOwner = useCallback(
    (newOwner: UserID) => {
      model.setOwner(newOwner, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy) => {
      model.setAccessPolicy(newPolicy, () => toast.success(information.changesSaved));
    },
    [model]
  );

  function generateQR(): string {
    const currentRef = window.location.href;
    return currentRef.includes('?') ? currentRef + '&qr' : currentRef + '?qr';
  }

  return (
    <RSEditContext
      value={{
        schema: model.schema,
        updateSchema,
        selected,
        isMutable,
        isContentEditable,
        isProcessing: model.processing,
        isAttachedToOSS,
        canProduceStructure,
        canDeleteSelected,

        setOwner,
        setAccessPolicy,
        promptEditors,
        promptLocation,

        setSelected: setSelected,
        select: (target: ConstituentaID) => setSelected(prev => [...prev, target]),
        deselect: (target: ConstituentaID) => setSelected(prev => prev.filter(id => id !== target)),
        toggleSelect: (target: ConstituentaID) =>
          setSelected(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
        deselectAll: () => setSelected([]),

        viewOSS,
        viewVersion,
        viewPredecessor,
        createVersion,
        restoreVersion,
        promptEditVersions,

        moveUp,
        moveDown,
        createCst,
        cloneCst,
        renameCst,
        promptDeleteCst,
        editTermForms,

        promptTemplate,
        promptClone,
        promptUpload: () => showUpload({ upload: model.upload }),
        download,
        share,

        reindex,
        reorder,
        inlineSynthesis,
        produceStructure,
        substitute,

        showTypeGraph: () => showTypeGraph({ items: typeInfo }),
        showQR: () => showQR({ target: generateQR() })
      }}
    >
      {children}
    </RSEditContext>
  );
};

// ====== Internals =========
function getNextActiveOnDelete(
  activeID: ConstituentaID | undefined,
  items: IConstituenta[],
  deleted: ConstituentaID[]
): ConstituentaID | undefined {
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
