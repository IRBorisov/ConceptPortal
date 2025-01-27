'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useAuth } from '@/backend/auth/useAuth';
import { useDeleteItem } from '@/backend/library/useDeleteItem';
import { ICstCreateDTO } from '@/backend/rsform/api';
import { useCstCreate } from '@/backend/rsform/useCstCreate';
import { useCstDelete } from '@/backend/rsform/useCstDelete';
import { useCstMove } from '@/backend/rsform/useCstMove';
import { useRSFormSuspense } from '@/backend/rsform/useRSForm';
import { ILibraryItemEditor, LibraryItemID, VersionID } from '@/models/library';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from '@/models/rsform';
import { generateAlias } from '@/models/rsformAPI';
import { UserRole } from '@/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { useRoleStore } from '@/stores/role';
import { PARAMETER, prefixes } from '@/utils/constants';
import { information, prompts } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { OssTabID } from '../OssPage/OssEditContext';

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

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  isAttachedToOSS: boolean;
  canDeleteSelected: boolean;

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
  versionID?: VersionID;
}

export const RSEditState = ({ itemID, versionID, activeTab, children }: React.PropsWithChildren<RSEditStateProps>) => {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const adjustRole = useRoleStore(state => state.adjustRole);

  const { schema } = useRSFormSuspense({ itemID: itemID, version: versionID });
  const { isModified } = useModificationStore();

  const isOwned = user?.id === schema?.owner || false;
  const isArchive = !!versionID;
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
        isEditor: (user && schema?.editors.includes(user?.id)) ?? false,
        isStaff: user?.is_staff ?? false,
        adminMode: adminMode
      }),
    [schema, adjustRole, isOwned, user, adminMode]
  );

  function navigateOss(target: LibraryItemID, newTab?: boolean) {
    router.push(urls.oss(target), newTab);
  }

  function navigateRSForm({ tab, activeID }: { tab: RSTabID; activeID?: ConstituentaID }) {
    if (!schema) {
      return;
    }
    const data = {
      id: schema.id,
      tab: tab,
      active: activeID,
      version: versionID
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
    if (!schema || !window.confirm(prompts.deleteLibraryItem)) {
      return;
    }
    const ossID = schema.oss.length > 0 ? schema.oss[0].id : undefined;
    deleteItem(schema.id, () => {
      toast.success(information.itemDestroyed);
      if (ossID) {
        router.push(urls.oss(ossID, OssTabID.GRAPH));
      } else {
        router.push(urls.library);
      }
    });
  }

  function handleCreateCst(data: ICstCreateDTO) {
    data.alias = data.alias || generateAlias(data.cst_type, schema);
    cstCreate({ itemID: itemID, data }, newCst => {
      toast.success(information.newConstituent(newCst.alias));
      setSelected([newCst.id]);
      navigateRSForm({ tab: activeTab, activeID: newCst.id });
      if (activeTab === RSTabID.CST_LIST) {
        setTimeout(() => {
          const element = document.getElementById(`${prefixes.cst_list}${newCst.alias}`);
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

    const deletedNames = deleted.map(id => schema.cstByID.get(id)!.alias).join(', ');
    const isEmpty = deleted.length === schema.items.length;
    const nextActive = isEmpty ? undefined : getNextActiveOnDelete(activeCst?.id, schema.items, deleted);

    cstDelete({ itemID: itemID, data }, () => {
      toast.success(information.constituentsDestroyed(deletedNames));
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
    if (!schema.items || selected.length === 0) {
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
    cstMove({
      itemID: itemID,
      data: {
        items: selected,
        move_to: target
      }
    });
  }

  function moveDown() {
    if (!schema.items || selected.length === 0) {
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
    cstMove({
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

        isOwned,
        isArchive,
        isMutable,
        isContentEditable,
        isAttachedToOSS,
        canDeleteSelected,

        navigateRSForm,
        navigateCst,

        deleteSchema,
        navigateOss,

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
