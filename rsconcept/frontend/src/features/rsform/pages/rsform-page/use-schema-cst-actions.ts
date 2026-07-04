'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { useTx } from '@/i18n';
import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library';
import { generateAlias, removeAliasReference } from '@rsconcept/domain/library/rsform-api';

import { type UnsavedSaveHandler, useConceptNavigation, useUnsavedChanges } from '@/app';

import { useModificationStore } from '@/stores/modification';
import { PARAMETER, prefixes } from '@/utils/constants';

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
import { useCreateConstituentsBatch } from '../../backend/use-create-constituents-batch';
import { useDeleteAttribution } from '../../backend/use-delete-attribution';
import { useDeleteConstituents } from '../../backend/use-delete-constituents';
import { useMoveConstituents } from '../../backend/use-move-constituents';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { useUpdateCrucial } from '../../backend/use-update-crucial';
import { useRsformDialogsStore } from '../../dialogs/rsform-dialog-store';
import { buildCloneConstituentsBatch } from '../../utils/build-clone-batch';
import { scrollToConstituentElement } from '../../utils/scroll-to-constituent';

interface UseSchemaCstActionsParams {
  schema: RSForm;
  itemID: number;
}

export function useSchemaCstActions({ schema, itemID }: UseSchemaCstActionsParams) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { promptUnsaved } = useUnsavedChanges();
  const isModified = useModificationStore(state => state.isModified);

  const { createConstituenta: cstCreate } = useCreateConstituenta();
  const { createConstituentsBatch: cstCreateBatch } = useCreateConstituentsBatch();
  const { deleteConstituents: cstDelete } = useDeleteConstituents();
  const { moveConstituents: cstMove } = useMoveConstituents();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions: clearCstAttributions } = useClearAttributions();
  const { updateConstituenta } = useUpdateConstituenta();
  const { updateCrucial } = useUpdateCrucial();
  const { generateLexeme } = useGenerateLexeme();

  const showCreateCst = useRsformDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useRsformDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useRsformDialogsStore(state => state.showCstTemplate);
  const showEditTerm = useRsformDialogsStore(state => state.showEditWordForms);
  const showRenameCst = useRsformDialogsStore(state => state.showRenameCst);

  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [pendingActiveID, setPendingActiveID] = useState<number | null>(null);
  const [focusCst, setFocusCst] = useState<Constituenta | null>(null);

  const activeCst = selectedCst.length === 0 ? null : (schema.cstByID.get(selectedCst[selectedCst.length - 1]) ?? null);
  const canDeleteSelected =
    (selectedCst.length > 0 && selectedCst.every(id => !schema.cstByID.get(id)?.is_inherited)) ||
    (selectedCst.length === 0 && selectedEdges.length === 1);

  function handleSetFocus(newValue: Constituenta | null) {
    setFocusCst(newValue);
    deselectAll();
  }

  function onCreateCst(newCst: ConstituentaBasicsDTO) {
    onCreateCstBatch([newCst.id]);
  }

  function onCreateCstBatch(newIDs: number[]) {
    if (newIDs.length === 0) {
      return;
    }
    const lastID = newIDs[newIDs.length - 1];
    setPendingActiveID(lastID);
    setSelectedCst(newIDs);
    router.changeActive(lastID);
    setTimeout(function scrollToCreatedConstituenta() {
      scrollToConstituentElement(prefixes.cst_list, lastID, { behavior: 'smooth' });
    }, PARAMETER.refreshTimeout);
  }

  async function cloneCst(options?: { insertAfter?: number | null; cstIDs?: number[] }): Promise<number> {
    const ids = options?.cstIDs ?? selectedCst;
    if (ids.length === 0) {
      throw new Error('No cst to clone');
    }
    const insertAfter = options && 'insertAfter' in options ? (options.insertAfter ?? null) : (activeCst?.id ?? null);
    const response = await cstCreateBatch({
      itemID: schema.id,
      data: buildCloneConstituentsBatch(schema, ids, insertAfter)
    });
    const newIDs = response.cst_list.map(cst => cst.id);
    onCreateCstBatch(newIDs);
    return newIDs[newIDs.length - 1];
  }

  function moveToIndex(targetIndex: number, selected = selectedCst) {
    if (selected.length === 0) {
      return;
    }
    void cstMove({
      itemID: itemID,
      data: {
        items: selected,
        move_to: targetIndex
      }
    });
  }

  function moveAfter(afterID: number | null, selected = selectedCst) {
    const remaining = schema.items.filter(cst => !selected.includes(cst.id));
    const afterIndex = afterID === null ? -1 : remaining.findIndex(cst => cst.id === afterID);
    if (afterID !== null && afterIndex === -1) {
      return;
    }
    moveToIndex(afterIndex + 1, selected);
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
    moveToIndex(target);
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
    moveToIndex(target);
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
      typification_manual: '',
      value_is_property: false,
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
      typification_manual: '',
      value_is_property: false,
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
        toast.error(tx('tx.termGraph.edit.validate.inheritedEdge'));
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
        toast.error(tx('tx.concept.inherited.definition.readOnly'));
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

  async function promptTemplate() {
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    showCstTemplate({
      schema: schema,
      insertAfter: activeCst?.id,
      onCreate: batch =>
        void cstCreateBatch({ itemID: schema.id, data: batch }).then(response =>
          onCreateCstBatch(response.cst_list.map(cst => cst.id))
        )
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

  function toggleValueClass() {
    if (!activeCst) {
      return;
    }
    void updateConstituenta({
      itemID: schema.id,
      data: {
        target: activeCst.id,
        item_data: {
          value_is_property: !activeCst.value_is_property
        }
      }
    });
  }

  async function createCstFromData(data: CreateConstituentaDTO): Promise<ConstituentaCreatedResponse> {
    return cstCreate({ itemID: schema.id, data });
  }

  async function patchConstituenta(data: UpdateConstituentaDTO): Promise<RSFormDTO> {
    return updateConstituenta({ itemID: schema.id, data });
  }

  async function openTermEditor(onSave?: UnsavedSaveHandler) {
    if (!activeCst) {
      return;
    }
    if (isModified) {
      const outcome = await promptUnsaved({ onSave });
      if (outcome === 'cancel') {
        return;
      }
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

  return {
    focusCst,
    selectedCst,
    selectedEdges,
    activeCst,
    pendingActiveID,
    canDeleteSelected,

    setFocus: handleSetFocus,
    clearPendingActiveID: () => setPendingActiveID(null),
    setSelectedCst,
    setSelectedEdges,
    selectCst: (target: number) => setSelectedCst(prev => [...prev, target]),
    deselectCst: (target: number) => setSelectedCst(prev => prev.filter(id => id !== target)),
    toggleSelectCst: (target: number) =>
      setSelectedCst(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target])),
    deselectAll,

    moveUp,
    moveDown,
    moveAfter,
    toggleCrucial,
    toggleValueClass,
    createCst,
    createCstFromData,
    promptCreateCst,
    cloneCst,
    promptDeleteSelected,
    promptTemplate: () => void promptTemplate(),

    patchConstituenta,
    openTermEditor: (onSave?: UnsavedSaveHandler) => void openTermEditor(onSave),
    promptRename,
    addAttribution,
    removeAttribution,
    clearAttributions
  };
}

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
