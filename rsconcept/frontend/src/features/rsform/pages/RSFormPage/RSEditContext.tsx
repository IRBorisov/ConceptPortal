'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth/backend/useAuth';
import { useDeleteItem } from '@/features/library/backend/useDeleteItem';
import { ILibraryItemEditor, LibraryItemID, VersionID } from '@/features/library/models/library';
import { useLibrarySearchStore } from '@/features/library/stores/librarySearch';
import { OssTabID } from '@/features/oss/pages/OssPage/OssEditContext';
import { UserRole } from '@/features/users/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { useRoleStore } from '@/stores/role';
import { PARAMETER, prefixes } from '@/utils/constants';
import { prompts } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { ICstCreateDTO } from '../../backend/api';
import { useCstCreate } from '../../backend/useCstCreate';
import { useCstDelete } from '../../backend/useCstDelete';
import { useCstMove } from '../../backend/useCstMove';
import { useRSFormSuspense } from '../../backend/useRSForm';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from '../../models/rsform';
import { generateAlias } from '../../models/rsformAPI';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

export interface IRSEditContext extends ILibraryItemEditor {
  schema: IRSForm;
  selected: ConstituentaID[];
  activeCst?: IConstituenta;
  activeVersion?: VersionID;

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  isAttachedToOSS: boolean;
  canDeleteSelected: boolean;

  navigateVersion: (versionID: VersionID | undefined) => void;
  navigateRSForm: ({ tab, activeID }: { tab: RSTabID; activeID?: ConstituentaID }) => void;
  navigateCst: (cstID: ConstituentaID) => void;
  navigateOss: (target: LibraryItemID, newTab?: boolean) => void;

  deleteSchema: () => void;

  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
  select: (target: ConstituentaID) => void;
  deselect: (target: ConstituentaID) => void;
  toggleSelect: (target: ConstituentaID) => void;
  deselectAll: () => void;

  moveUp: () => void;
  moveDown: () => void;
  createCst: (type: CstType | undefined, skipDialog: boolean, definition?: string) => void;
  cloneCst: () => void;
  promptDeleteCst: () => void;
  promptTemplate: () => void;
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
  itemID: LibraryItemID;
  activeTab: RSTabID;
  activeVersion?: VersionID;
}

export const RSEditState = ({
  itemID,
  activeVersion,
  activeTab,
  children
}: React.PropsWithChildren<RSEditStateProps>) => {
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const adjustRole = useRoleStore(state => state.adjustRole);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuthSuspense();
  const { schema } = useRSFormSuspense({ itemID: itemID, version: activeVersion });
  const { isModified } = useModificationStore();

  const isOwned = !!user.id && user.id === schema.owner;
  const isArchive = !!activeVersion;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isContentEditable = isMutable && !isArchive;
  const isAttachedToOSS = schema.oss.length > 0;

  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const canDeleteSelected = selected.length > 0 && selected.every(id => !schema.cstByID.get(id)?.is_inherited);

  const activeCst = selected.length === 0 ? undefined : schema.cstByID.get(selected[selected.length - 1]);

  const { cstCreate } = useCstCreate();
  const { cstMove } = useCstMove();
  const { cstDelete } = useCstDelete();
  const { deleteItem } = useDeleteItem();

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);

  useEffect(
    () =>
      adjustRole({
        isOwner: isOwned,
        isEditor: !!user.id && schema.editors.includes(user.id),
        isStaff: user.is_staff,
        adminMode: adminMode
      }),
    [schema, adjustRole, isOwned, user, adminMode]
  );

  function navigateVersion(versionID: VersionID | undefined) {
    router.push(urls.schema(schema.id, versionID));
  }

  function navigateOss(target: LibraryItemID, newTab?: boolean) {
    router.push(urls.oss(target), newTab);
  }

  function navigateRSForm({ tab, activeID }: { tab: RSTabID; activeID?: ConstituentaID }) {
    const data = {
      id: schema.id,
      tab: tab,
      active: activeID,
      version: activeVersion
    };
    const url = urls.schema_props(data);
    if (activeID) {
      if (tab === activeTab && tab !== RSTabID.CST_EDIT) {
        router.replace(url);
      } else {
        router.push(url);
      }
    } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
      data.active = schema.items[0].id;
      router.replace(urls.schema_props(data));
    } else {
      router.push(url);
    }
  }

  function navigateCst(cstID: ConstituentaID) {
    if (cstID !== activeCst?.id || activeTab !== RSTabID.CST_EDIT) {
      navigateRSForm({ tab: RSTabID.CST_EDIT, activeID: cstID });
    }
  }

  function deleteSchema() {
    if (!window.confirm(prompts.deleteLibraryItem)) {
      return;
    }
    const ossID = schema.oss.length > 0 ? schema.oss[0].id : undefined;
    void deleteItem(schema.id).then(() => {
      if (ossID) {
        router.push(urls.oss(ossID, OssTabID.GRAPH));
      } else {
        if (searchLocation === schema.location) {
          setSearchLocation('');
        }
        router.push(urls.library);
      }
    });
  }

  function handleCreateCst(data: ICstCreateDTO) {
    data.alias = data.alias || generateAlias(data.cst_type, schema);
    void cstCreate({ itemID: itemID, data }).then(newCst => {
      setSelected([newCst.id]);
      navigateRSForm({ tab: activeTab, activeID: newCst.id });
      if (activeTab === RSTabID.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.id}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'end'
            });
          }
        }, PARAMETER.refreshTimeout);
      }
    });
  }

  function handleDeleteCst(deleted: ConstituentaID[]) {
    const data = {
      items: deleted
    };

    const isEmpty = deleted.length === schema.items.length;
    const nextActive = isEmpty ? undefined : getNextActiveOnDelete(activeCst?.id, schema.items, deleted);

    void cstDelete({ itemID: itemID, data }).then(() => {
      setSelected(nextActive ? [nextActive] : []);
      if (!nextActive) {
        navigateRSForm({ tab: RSTabID.CST_LIST });
      } else if (activeTab === RSTabID.CST_EDIT) {
        navigateRSForm({ tab: activeTab, activeID: nextActive });
      } else {
        navigateRSForm({ tab: activeTab });
      }
    });
  }

  function moveUp() {
    if (selected.length === 0) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selected.includes(cst.id)) {
        return prev;
      } else if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1);
    void cstMove({
      itemID: itemID,
      data: {
        items: selected,
        move_to: target
      }
    });
  }

  function moveDown() {
    if (selected.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
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
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2);
    void cstMove({
      itemID: itemID,
      data: {
        items: selected,
        move_to: target
      }
    });
  }

  function createCst(type: CstType | undefined, skipDialog: boolean, definition?: string) {
    const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
    const data: ICstCreateDTO = {
      insert_after: activeCst?.id ?? null,
      cst_type: targetType,
      alias: generateAlias(targetType, schema),
      term_raw: '',
      definition_formal: definition ?? '',
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    if (skipDialog) {
      handleCreateCst(data);
    } else {
      showCreateCst({ schema: schema, onCreate: handleCreateCst, initial: data });
    }
  }

  function cloneCst() {
    if (!activeCst) {
      return;
    }
    const data: ICstCreateDTO = {
      insert_after: activeCst.id,
      cst_type: activeCst.cst_type,
      alias: generateAlias(activeCst.cst_type, schema),
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      term_forms: activeCst.term_forms
    };
    handleCreateCst(data);
  }

  function promptDeleteCst() {
    showDeleteCst({ schema: schema, selected: selected, onDelete: handleDeleteCst });
  }
  function promptTemplate() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCstTemplate({ schema: schema, onCreate: handleCreateCst, insertAfter: activeCst?.id });
  }

  return (
    <RSEditContext
      value={{
        schema,
        selected,
        activeCst,
        activeVersion,

        isOwned,
        isArchive,
        isMutable,
        isContentEditable,
        isAttachedToOSS,
        canDeleteSelected,

        navigateVersion,
        navigateRSForm,
        navigateCst,
        navigateOss,

        deleteSchema,

        setSelected,
        select: (target: ConstituentaID) => setSelected(prev => [...prev, target]),
        deselect: (target: ConstituentaID) => setSelected(prev => prev.filter(id => id !== target)),
        toggleSelect: (target: ConstituentaID) =>
          setSelected(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
        deselectAll: () => setSelected([]),

        moveUp,
        moveDown,
        createCst,
        cloneCst,
        promptDeleteCst,

        promptTemplate
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
