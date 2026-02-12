'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuthSuspense } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useLibrarySuspense } from '@/features/library/backend/use-library';
import { useRoleStore, UserRole } from '@/features/users';
import { useAdjustRole } from '@/features/users/stores/use-adjust-role';

import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER, prefixes } from '@/utils/constants';
import { errorMsg, promptText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { promptUnsaved } from '@/utils/utils';

import { type ConstituentaBasicsDTO, type CreateConstituentaDTO } from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useDeleteAttribution } from '../../backend/use-delete-attribution';
import { useMoveConstituents } from '../../backend/use-move-constituents';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { type Constituenta, CstType } from '../../models/rsform';
import { generateAlias, removeAliasReference } from '../../models/rsform-api';

import { RSEditContext } from './rsedit-context';

interface RSEditStateProps {
  itemID: number;
  activeVersion?: number;
}

export const RSEditState = ({
  itemID,
  activeVersion,
  children
}: React.PropsWithChildren<RSEditStateProps>) => {
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuthSuspense();
  const { schema } = useRSFormSuspense({ itemID: itemID, version: activeVersion });
  const { items: library } = useLibrarySuspense();
  const isModified = useModificationStore(state => state.isModified);

  const isOwned = !!user.id && user.id === schema.owner;
  const isArchive = !!activeVersion;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isContentEditable = isMutable && !isArchive;
  const isAttachedToOSS = (() => {
    if (schema.oss.length === 0) {
      return false;
    }
    for (const ossRef of schema.oss) {
      const oss = library.find(item => item.id === ossRef.id);
      if (oss?.owner === schema.owner && oss.location === schema.location) {
        return true;
      }
    }
    return false;
  })();
  const isEditor = !!user.id && schema.editors.includes(user.id);

  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const canDeleteSelected =
    (selectedCst.length > 0 && selectedCst.every(id => !schema.cstByID.get(id)?.is_inherited)) ||
    (selectedCst.length === 0 && selectedEdges.length === 1);
  const [focusCst, setFocusCst] = useState<Constituenta | null>(null);

  const activeCst = selectedCst.length === 0 ? null : schema.cstByID.get(selectedCst[selectedCst.length - 1])!;

  const { createConstituenta: cstCreate } = useCreateConstituenta();
  const { moveConstituents: cstMove } = useMoveConstituents();
  const { deleteItem } = useDeleteItem();
  const { deleteAttribution } = useDeleteAttribution();
  const { updateConstituenta } = useUpdateConstituenta();

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const setCurrentConstituenta = useAIStore(state => state.setConstituenta);

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

  function handleSetFocus(newValue: Constituenta | null) {
    setFocusCst(newValue);
    deselectAll();
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

  function onCreateCst(newCst: RO<ConstituentaBasicsDTO>) {
    setSelectedCst([newCst.id]);
    router.changeActive(newCst.id);
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

  function promptCreateCst(type?: CstType, definition?: string): Promise<number | null> {
    const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
    const data: CreateConstituentaDTO = {
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
    return new Promise(resolve => {
      showCreateCst({
        schemaID: schema.id,
        initial: data,

        onCreate: newCst => {
          onCreateCst(newCst);
          resolve(newCst.id);
        },

        onCancel: () => {
          resolve(null);
        }
      });
    });
  }

  function createCst(type?: CstType, definition?: string): Promise<number> {
    const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
    const data: CreateConstituentaDTO = {
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
    return cstCreate({ itemID: schema.id, data }).then(newCst => {
      onCreateCst(newCst);
      return newCst.id;
    });
  }

  function cloneCst() {
    if (!activeCst) {
      throw new Error('No active cst');
    }
    return cstCreate({
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
    }).then(newCst => {
      onCreateCst(newCst);
      return newCst.id;
    });
  }

  function promptDeleteSelected() {
    if (!canDeleteSelected) {
      return;
    }
    if (selectedCst.length > 0) {
      deleteSelectedCst();
    } else if (selectedEdges.length === 1) {
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
          router.gotoCstList(schema.id);
        } else {
          router.changeActive(nextActive);
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
    const sourceCst = schema.cstByID.get(sourceID);
    const targetCst = schema.cstByID.get(targetID);
    if (!targetCst || !sourceCst) {
      throw new Error('Constituents not found');
    }
    if (schema.attribution_graph.hasEdge(sourceID, targetID)) {
      if (targetCst.parent_schema !== null && targetCst.parent_schema === sourceCst.parent_schema) {
        toast.error(errorMsg.deleteInheritedEdge);
        return;
      }
      void deleteAttribution({
        itemID: schema.id,
        data: {
          container: sourceID,
          attribute: targetID
        }
      });
    } else if (schema.graph.hasEdge(sourceID, targetID)) {
      if (targetCst.is_inherited) {
        toast.error(errorMsg.changeInheritedDefinition);
        return;
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
        promptCreateCst,
        cloneCst,
        promptDeleteSelected,

        promptTemplate
      }}
    >
      {children}
    </RSEditContext>
  );
};

// ====== Internals =========
function getNextActiveOnDelete(activeID: number | null, items: Constituenta[], deleted: number[]): number | null {
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
