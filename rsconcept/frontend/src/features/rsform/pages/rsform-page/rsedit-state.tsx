'use client';

import { useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuthSuspense } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRoleStore, UserRole } from '@/features/users';
import { useAdjustRole } from '@/features/users/stores/use-adjust-role';

import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER, prefixes } from '@/utils/constants';
import { promptText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { promptUnsaved } from '@/utils/utils';

import { CstType, type IConstituentaBasicsDTO, type ICreateConstituentaDTO } from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useDeleteAttribution } from '../../backend/use-delete-attribution';
import { useMoveConstituents } from '../../backend/use-move-constituents';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { type IConstituenta } from '../../models/rsform';
import { generateAlias, removeAliasReference } from '../../models/rsform-api';
import { InteractionMode, useTermGraphStore } from '../../stores/term-graph';

import { RSEditContext, RSTabID } from './rsedit-context';

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
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuthSuspense();
  const { schema } = useRSFormSuspense({ itemID: itemID, version: activeVersion });
  const isModified = useModificationStore(state => state.isModified);

  const isOwned = !!user.id && user.id === schema.owner;
  const isArchive = !!activeVersion;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isContentEditable = isMutable && !isArchive;
  const isAttachedToOSS = schema.oss.length > 0;
  const isEditor = !!user.id && schema.editors.includes(user.id);
  const mode = useTermGraphStore(state => state.mode);

  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const canDeleteSelected =
    (selectedCst.length > 0 && selectedCst.every(id => !schema.cstByID.get(id)?.is_inherited)) ||
    (selectedEdges.length === 1 && mode === InteractionMode.edit);
  const [focusCst, setFocusCst] = useState<IConstituenta | null>(null);

  const activeCst = selectedCst.length === 0 ? null : schema.cstByID.get(selectedCst[selectedCst.length - 1])!;

  const { createConstituenta: cstCreate } = useCreateConstituenta();
  const { moveConstituents: cstMove } = useMoveConstituents();
  const { deleteItem } = useDeleteItem();
  const { deleteAttribution } = useDeleteAttribution();
  const { updateConstituenta } = useUpdateConstituenta();

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);
  const setCurrentSchema = useAIStore(state => state.setCurrentSchema);
  const setCurrentConstituenta = useAIStore(state => state.setCurrentConstituenta);

  useAdjustRole({
    isOwner: isOwned,
    isEditor: isEditor,
    isStaff: user.is_staff,
    adminMode: adminMode
  });

  useEffect(() => {
    setCurrentSchema(schema);
    return () => setCurrentSchema(null);
  }, [schema, setCurrentSchema]);

  useEffect(() => {
    setCurrentConstituenta(activeCst);
    return () => setCurrentConstituenta(null);
  }, [activeCst, setCurrentConstituenta]);

  function handleSetFocus(newValue: IConstituenta | null) {
    setFocusCst(newValue);
    deselectAll();
  }

  function navigateVersion(versionID?: number) {
    router.push({ path: urls.schema(schema.id, versionID) });
  }

  function navigateOss(ossID: number, newTab?: boolean) {
    router.push({ path: urls.oss(ossID), newTab: newTab });
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
        router.replace({ path: url });
      } else {
        router.push({ path: url });
      }
    } else if (tab !== activeTab && tab === RSTabID.CST_EDIT && schema.items.length > 0) {
      data.active = schema.items[0].id;
      router.replace({ path: urls.schema_props(data) });
    } else {
      router.push({ path: url });
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
    void deleteItem({
      target: schema.id,
      beforeInvalidate: () => {
        if (ossID) {
          return router.pushAsync({ path: urls.oss(ossID), force: true });
        } else {
          if (searchLocation === schema.location) {
            setSearchLocation('');
          }
          return router.pushAsync({ path: urls.library, force: true });
        }
      }
    });
  }

  function onCreateCst(newCst: RO<IConstituentaBasicsDTO>) {
    setSelectedCst([newCst.id]);
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
    if (selectedCst.length === 0) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCst.includes(cst.id)) {
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
        items: selectedCst,
        move_to: target
      }
    });
  }

  function moveDown() {
    if (selectedCst.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCst.includes(cst.id)) {
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
        items: selectedCst,
        move_to: target
      }
    });
  }

  function createCst(type: CstType | null, skipDialog: boolean, definition?: string) {
    const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
    const data: ICreateConstituentaDTO = {
      insert_after: activeCst?.id ?? null,
      cst_type: targetType,
      alias: generateAlias(targetType, schema),
      term_raw: '',
      definition_formal: definition ?? '',
      definition_raw: '',
      convention: '',
      crucial: false,
      term_forms: []
    };
    if (skipDialog) {
      void cstCreate({ itemID: schema.id, data }).then(onCreateCst);
    } else {
      showCreateCst({ schemaID: schema.id, onCreate: onCreateCst, initial: data });
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
        crucial: activeCst.crucial,
        term_forms: activeCst.term_forms
      }
    }).then(onCreateCst);
  }

  function promptDeleteSelected() {
    if (!canDeleteSelected) {
      return;
    }
    if (mode === InteractionMode.explore || selectedEdges.length === 0) {
      deleteSelectedCst();
    } else {
      deleteSelectedEdge();
    }
  }

  function deleteSelectedCst() {
    if (!selectedCst.length) {
      return;
    }
    showDeleteCst({
      schemaID: schema.id,
      selected: selectedCst,
      afterDelete: (schema, deleted) => {
        const isEmpty = deleted.length === schema.items.length;
        const nextActive = isEmpty ? null : getNextActiveOnDelete(activeCst?.id ?? null, schema.items, deleted);
        setSelectedCst(nextActive ? [nextActive] : []);
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

  function deleteSelectedEdge() {
    if (!selectedEdges.length) {
      return;
    }
    const ids = selectedEdges[0].split('-');
    const sourceID = Number(ids[0]);
    const targetID = Number(ids[1]);
    if (schema.attribution_graph.hasEdge(sourceID, targetID)) {
      void deleteAttribution({
        itemID: schema.id,
        data: {
          container: sourceID,
          attribute: targetID
        }
      });
    } else if (schema.graph.hasEdge(sourceID, targetID)) {
      const sourceCst = schema.cstByID.get(sourceID);
      const targetCst = schema.cstByID.get(targetID);
      if (!targetCst || !sourceCst) {
        throw new Error('Constituents not found');
      }
      const newExpressions = removeAliasReference(targetCst.definition_formal, sourceCst.alias);
      void updateConstituenta({
        itemID: schema.id,
        data: {
          target: targetID,
          item_data: {
            definition_formal: newExpressions
          }
        }
      });
    } else {
      throw new Error('Graph edge not found');
    }
  }

  function promptTemplate() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCstTemplate({ schemaID: schema.id, onCreate: onCreateCst, insertAfter: activeCst?.id });
  }

  function deselectAll() {
    setSelectedCst([]);
    setSelectedEdges([]);
  }

  return (
    <RSEditContext
      value={{
        schema,
        focusCst,
        selectedCst,
        selectedEdges,
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
        setSelectedCst: setSelectedCst,
        setSelectedEdges: setSelectedEdges,
        selectCst: (target: number) => setSelectedCst(prev => [...prev, target]),
        deselectCst: (target: number) => setSelectedCst(prev => prev.filter(id => id !== target)),
        toggleSelectCst: (target: number) =>
          setSelectedCst(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
        deselectAll: deselectAll,

        moveUp,
        moveDown,
        createCst,
        createCstDefault: () => createCst(null, false),
        cloneCst,
        promptDeleteSelected: promptDeleteSelected,

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
