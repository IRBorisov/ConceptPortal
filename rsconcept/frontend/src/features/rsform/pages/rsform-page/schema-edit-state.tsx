'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { type Constituenta, CstType } from '@/domain/library';
import { generateAlias, removeAliasReference } from '@/domain/library/rsform-api';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';
import { useRoleStore, UserRole } from '@/features/users';
import { useAdjustRole } from '@/features/users/stores/use-adjust-role';

import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER, prefixes } from '@/utils/constants';
import { errorMsg, promptText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { promptUnsaved } from '@/utils/utils';

import { useGenerateLexeme } from '../../backend/cctext/use-generate-lexeme';
import {
  type ConstituentaBasicsDTO,
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '../../backend/types';
import { useClearAttributions } from '../../backend/use-clear-attributions';
import { useCreateAttribution } from '../../backend/use-create-attribution';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useDeleteAttribution } from '../../backend/use-delete-attribution';
import { useDeleteConstituents } from '../../backend/use-delete-constituents';
import { useMoveConstituents } from '../../backend/use-move-constituents';
import { useMutatingRSForm } from '../../backend/use-mutating-rsform';
import { useRSForm } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { useUpdateCrucial } from '../../backend/use-update-crucial';

import { SchemaEditContext } from './schema-edit-context';

interface SchemaEditStateProps {
  itemID: number;
  activeVersion?: number;
  /** When set (e.g. on the RSModel page), includes RSModel mutations; otherwise only RSForm mutations. */
  isProcessing?: boolean;
}

export const SchemaEditState = ({
  itemID,
  activeVersion,
  isProcessing: isProcessingProp,
  children
}: React.PropsWithChildren<SchemaEditStateProps>) => {
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuth();
  const { schema } = useRSForm({ itemID: itemID, version: activeVersion });
  const isMutatingForm = useMutatingRSForm();
  const isProcessing = isProcessingProp ?? isMutatingForm;
  const isModified = useModificationStore(state => state.isModified);

  const isOwned = !!user.id && user.id === schema.owner;
  const isArchive = !!activeVersion;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isContentEditable = isMutable && !isArchive;
  const isEditor = !!user.id && schema.editors.includes(user.id);

  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [pendingActiveID, setPendingActiveID] = useState<number | null>(null);
  const canDeleteSelected =
    (selectedCst.length > 0 && selectedCst.every(id => !schema.cstByID.get(id)?.is_inherited)) ||
    (selectedCst.length === 0 && selectedEdges.length === 1);
  const [focusCst, setFocusCst] = useState<Constituenta | null>(null);

  const activeCst = selectedCst.length === 0 ? null : (schema.cstByID.get(selectedCst[selectedCst.length - 1]) ?? null);

  const { createConstituenta: cstCreate } = useCreateConstituenta();
  const { deleteConstituents: cstDelete } = useDeleteConstituents();
  const { moveConstituents: cstMove } = useMoveConstituents();
  const { deleteItem } = useDeleteItem();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions: clearCstAttributions } = useClearAttributions();
  const { updateConstituenta } = useUpdateConstituenta();
  const { updateCrucial } = useUpdateCrucial();
  const { findPredecessor } = useFindPredecessor();
  const { generateLexeme } = useGenerateLexeme();

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const showRenameCst = useDialogsStore(state => state.showRenameCst);
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const onSetSchema = useEffectEvent(setCurrentSchema);
  const setCurrentConstituenta = useAIStore(state => state.setConstituenta);
  const onSetConstituenta = useEffectEvent(setCurrentConstituenta);

  useAdjustRole({
    isOwner: isOwned,
    isEditor: isEditor,
    isStaff: user.is_staff,
    adminMode: adminMode
  });

  useEffect(
    function syncGlobalSchema() {
      onSetSchema(schema);
      return () => onSetSchema(null);
    },
    [schema]
  );

  useEffect(
    function syncGlobalConstituenta() {
      onSetConstituenta(activeCst);
      return () => onSetConstituenta(null);
    },
    [activeCst]
  );

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
    setPendingActiveID(newCst.id);
    setSelectedCst([newCst.id]);
    router.changeActive(newCst.id);
    setTimeout(function scrollToCreatedConstituenta() {
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
        schema: schema,
        initial: data,

        onCreate: (createData: CreateConstituentaDTO) =>
          void cstCreate({ itemID: schema.id, data: createData }).then(response => {
            const newCst = response.new_cst;
            onCreateCst(newCst);
            resolve(newCst.id);
          }),
        onCancel: () => resolve(null)
      });
    });
  }

  async function createCst(type?: CstType, definition?: string): Promise<number> {
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
    const response = await cstCreate({ itemID: schema.id, data });
    const newCst = response.new_cst;
    onCreateCst(newCst);
    return newCst.id;
  }

  async function cloneCst(): Promise<number> {
    if (!activeCst) {
      throw new Error('No active cst');
    }
    const response = await cstCreate({
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
    });
    const newCst = response.new_cst;
    onCreateCst(newCst);
    return newCst.id;
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
      schema: schema,
      selected: selectedCst,
      onDelete: deleted => {
        void cstDelete({
          itemID: schema.id,
          data: { items: deleted }
        }).then(updatedSchema => {
          const isEmpty = deleted.length === schema.items.length;
          const nextActive = isEmpty ? null : getNextActiveOnDelete(activeCst?.id ?? null, schema.items, deleted);
          setSelectedCst(nextActive ? [nextActive] : []);
          if (!nextActive) {
            router.gotoCstList(updatedSchema.id);
          } else {
            setPendingActiveID(null);
            router.changeActive(nextActive);
          }
        });
      }
    });
  }

  function deleteSelectedEdge() {
    if (!selectedEdges.length) {
      return;
    }
    const ids = selectedEdges[0].split('==');
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
    showCstTemplate({
      schema: schema,
      insertAfter: activeCst?.id,
      onCreate: value =>
        void cstCreate({ itemID: schema.id, data: value }).then(response => onCreateCst(response.new_cst))
    });
  }

  function deselectAll() {
    setSelectedCst([]);
    setSelectedEdges([]);
  }

  function toggleCrucial() {
    if (!activeCst) {
      return;
    }
    void updateCrucial({
      itemID: schema.id,
      data: {
        target: selectedCst,
        value: !activeCst.crucial
      }
    });
  }

  async function createCstFromData(data: CreateConstituentaDTO): Promise<RO<ConstituentaCreatedResponse>> {
    return cstCreate({ itemID: schema.id, data });
  }

  async function patchConstituenta(data: UpdateConstituentaDTO): Promise<RO<RSFormDTO>> {
    return updateConstituenta({ itemID: schema.id, data });
  }

  function openTermEditor() {
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({
      schema: schema,
      target: activeCst,
      onSave: data => void updateConstituenta({ itemID: schema.id, data }),
      generateLexeme: generateLexeme
    });
  }

  function promptRename() {
    if (!activeCst) {
      return;
    }
    showRenameCst({
      schema,
      target: activeCst,
      onRename: data => void updateConstituenta({ itemID: schema.id, data })
    });
  }

  function addAttribution(containerID: number, attributeID: number) {
    void createAttribution({
      itemID: schema.id,
      data: {
        container: containerID,
        attribute: attributeID
      }
    });
  }

  function removeAttribution(attribute: Constituenta) {
    if (!activeCst) {
      return;
    }
    void deleteAttribution({
      itemID: schema.id,
      data: {
        container: activeCst.id,
        attribute: attribute.id
      }
    });
  }

  function clearAttributions() {
    if (!activeCst) {
      return;
    }
    void clearCstAttributions({
      itemID: schema.id,
      data: {
        target: activeCst.id
      }
    });
  }

  function gotoPredecessor(target: number, newTab?: boolean) {
    void findPredecessor(target).then(reference => router.gotoCstEdit(reference.schema, reference.id, newTab));
  }

  return (
    <SchemaEditContext
      value={{
        schema,
        focusCst,
        selectedCst,
        selectedEdges,
        activeCst,
        pendingActiveID,
        activeVersion,

        isOwned,
        isArchive,
        isMutable,
        isContentEditable,
        canDeleteSelected,
        isProcessing,

        deleteSchema,

        patchConstituenta,
        createCstFromData,
        openTermEditor,
        promptRename,
        addAttribution,
        removeAttribution,
        clearAttributions,

        setFocus: handleSetFocus,
        clearPendingActiveID: () => setPendingActiveID(null),
        setSelectedCst: setSelectedCst,
        setSelectedEdges: setSelectedEdges,
        selectCst: (target: number) => setSelectedCst(prev => [...prev, target]),
        deselectCst: (target: number) => setSelectedCst(prev => prev.filter(id => id !== target)),
        toggleSelectCst: (target: number) =>
          setSelectedCst(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
        deselectAll: deselectAll,

        moveUp,
        moveDown,
        toggleCrucial,
        createCst,
        promptCreateCst,
        cloneCst,
        promptDeleteSelected,

        promptTemplate,

        gotoPredecessor: gotoPredecessor
      }}
    >
      {children}
    </SchemaEditContext>
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
