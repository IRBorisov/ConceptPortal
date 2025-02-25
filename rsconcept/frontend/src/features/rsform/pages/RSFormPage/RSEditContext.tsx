'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/useDeleteItem';
import { useRoleStore, UserRole } from '@/features/users';

import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER, prefixes } from '@/utils/constants';
import { promptText } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { CstType, type IConstituentaBasicsDTO, type ICstCreateDTO } from '../../backend/types';
import { useCstCreate } from '../../backend/useCstCreate';
import { useCstMove } from '../../backend/useCstMove';
import { useRSFormSuspense } from '../../backend/useRSForm';
import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { generateAlias } from '../../models/rsformAPI';

export enum RSTabID {
  CARD = 0,
  CST_LIST = 1,
  CST_EDIT = 2,
  TERM_GRAPH = 3
}

export interface IRSEditContext {
  schema: IRSForm;
  selected: number[];
  focusCst: IConstituenta | null;
  activeCst: IConstituenta | null;
  activeVersion?: number;

  isOwned: boolean;
  isArchive: boolean;
  isMutable: boolean;
  isContentEditable: boolean;
  isAttachedToOSS: boolean;
  canDeleteSelected: boolean;

  navigateVersion: (versionID?: number) => void;
  navigateRSForm: ({ tab, activeID }: { tab: RSTabID; activeID?: number }) => void;
  navigateCst: (cstID: number) => void;
  navigateOss: (ossID: number, newTab?: boolean) => void;

  deleteSchema: () => void;

  setFocus: (newValue: IConstituenta | null) => void;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  select: (target: number) => void;
  deselect: (target: number) => void;
  toggleSelect: (target: number) => void;
  deselectAll: () => void;

  moveUp: () => void;
  moveDown: () => void;
  createCst: (type: CstType, skipDialog: boolean, definition?: string) => void;
  createCstDefault: () => void;
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
  itemID: number;
  activeTab: RSTabID;
  activeVersion?: number;
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

  const [selected, setSelected] = useState<number[]>([]);
  const canDeleteSelected = selected.length > 0 && selected.every(id => !schema.cstByID.get(id)?.is_inherited);
  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);

  const activeCst = selected.length === 0 ? null : schema.cstByID.get(selected[selected.length - 1])!;

  const { cstCreate } = useCstCreate();
  const { cstMove } = useCstMove();
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

  function handleSetFocus(newValue: IConstituenta | null) {
    setFocusCst(newValue);
    setSelected([]);
  }

  function navigateVersion(versionID?: number) {
    router.push(urls.schema(schema.id, versionID));
  }

  function navigateOss(ossID: number, newTab?: boolean) {
    router.push(urls.oss(ossID), newTab);
  }

  function navigateRSForm({ tab, activeID }: { tab: RSTabID; activeID?: number }) {
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

  function navigateCst(cstID: number) {
    if (cstID !== activeCst?.id || activeTab !== RSTabID.CST_EDIT) {
      navigateRSForm({ tab: RSTabID.CST_EDIT, activeID: cstID });
    }
  }

  function deleteSchema() {
    if (!window.confirm(promptText.deleteLibraryItem)) {
      return;
    }
    const ossID = schema.oss.length > 0 ? schema.oss[0].id : null;
    void deleteItem(schema.id).then(() => {
      if (ossID) {
        router.push(urls.oss(ossID));
      } else {
        if (searchLocation === schema.location) {
          setSearchLocation('');
        }
        router.push(urls.library);
      }
    });
  }

  function onCreateCst(newCst: IConstituentaBasicsDTO) {
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

  function createCst(type: CstType | null, skipDialog: boolean, definition?: string) {
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
      void cstCreate({ itemID: schema.id, data }).then(onCreateCst);
    } else {
      showCreateCst({ schema: schema, onCreate: onCreateCst, initial: data });
    }
  }

  function cloneCst() {
    if (!activeCst) {
      return;
    }
    void cstCreate({
      itemID: schema.id,
      data: {
        insert_after: activeCst.id,
        cst_type: activeCst.cst_type,
        alias: generateAlias(activeCst.cst_type, schema),
        term_raw: activeCst.term_raw,
        definition_formal: activeCst.definition_formal,
        definition_raw: activeCst.definition_raw,
        convention: activeCst.convention,
        term_forms: activeCst.term_forms
      }
    }).then(onCreateCst);
  }

  function promptDeleteCst() {
    showDeleteCst({
      schema: schema,
      selected: selected,
      afterDelete: (schema, deleted) => {
        const isEmpty = deleted.length === schema.items.length;
        const nextActive = isEmpty ? null : getNextActiveOnDelete(activeCst?.id ?? null, schema.items, deleted);
        setSelected(nextActive ? [nextActive] : []);
        if (!nextActive) {
          navigateRSForm({ tab: RSTabID.CST_LIST });
        } else if (activeTab === RSTabID.CST_EDIT) {
          navigateRSForm({ tab: activeTab, activeID: nextActive });
        } else {
          navigateRSForm({ tab: activeTab });
        }
      }
    });
  }

  function promptTemplate() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCstTemplate({ schema: schema, onCreate: onCreateCst, insertAfter: activeCst?.id });
  }

  return (
    <RSEditContext
      value={{
        schema,
        focusCst,
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

        setFocus: handleSetFocus,
        setSelected,
        select: (target: number) => setSelected(prev => [...prev, target]),
        deselect: (target: number) => setSelected(prev => prev.filter(id => id !== target)),
        toggleSelect: (target: number) =>
          setSelected(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
        deselectAll: () => setSelected([]),

        moveUp,
        moveDown,
        createCst,
        createCstDefault: () => createCst(null, false),
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
function getNextActiveOnDelete(activeID: number | null, items: IConstituenta[], deleted: number[]): number | null {
  if (items.length === deleted.length) {
    return null;
  }

  let activeIndex = items.findIndex(cst => cst.id === activeID);
  if (activeIndex === -1) {
    return null;
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
