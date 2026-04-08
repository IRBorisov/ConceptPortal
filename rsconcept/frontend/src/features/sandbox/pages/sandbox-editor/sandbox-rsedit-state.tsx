'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';
import { type RSForm } from '@/features/rsform';
import {
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO
} from '@/features/rsform/backend/types';
import { type Constituenta, CstType } from '@/features/rsform/models/rsform';
import { generateAlias, removeAliasReference } from '@/features/rsform/models/rsform-api';
import { RSEditContext } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { PARAMETER, prefixes } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { notImplemented, promptUnsaved } from '@/utils/utils';

import { sbApi } from '../../backend/sandbox-mutations';
import { type SandboxBundle } from '../../models/bundle';

interface SandboxRSEditStateProps {
  schema: RSForm;
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
}

export function SandboxRSEditState({
  schema,
  setBundle,
  children
}: React.PropsWithChildren<SandboxRSEditStateProps>) {
  const router = useConceptNavigation();
  const isModified = useModificationStore(state => state.isModified);
  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showCstTemplate = useDialogsStore(state => state.showCstTemplate);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const showRenameCst = useDialogsStore(state => state.showRenameCst);

  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [pendingActiveID, setPendingActiveID] = useState<number | null>(null);
  const [focusCst, setFocusCst] = useState<Constituenta | null>(null);

  const selectedCstInSchema = useMemo(
    () => selectedCst.filter(id => schema.cstByID.has(id)),
    [schema, selectedCst]
  );

  const activeCst = useMemo(() => {
    if (selectedCstInSchema.length === 0) {
      return null;
    }
    const activeID = selectedCstInSchema[selectedCstInSchema.length - 1];
    return schema.cstByID.get(activeID) ?? null;
  }, [schema, selectedCstInSchema]);

  const canDeleteSelected =
    (selectedCstInSchema.length > 0 && selectedCstInSchema.every(id => !schema.cstByID.get(id)?.is_inherited)) ||
    (selectedCstInSchema.length === 0 && selectedEdges.length === 1);

  function onCreateCst(newCst: RO<ConstituentaCreatedResponse['new_cst']>) {
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

  function handleSetFocus(newValue: Constituenta | null) {
    setFocusCst(newValue);
    deselectAll();
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
        schema,
        initial: data,
        onCreate: createData => {
          void createCstFromData(createData).then(response => {
            onCreateCst(response.new_cst);
            resolve(response.new_cst.id);
          });
        },
        onCancel: function onCancel() {
          resolve(null);
        }
      });
    });
  }

  async function createCst(type?: CstType, definition?: string): Promise<number> {
    const targetType = type ?? activeCst?.cst_type ?? CstType.BASE;
    const response = await createCstFromData({
      insert_after: activeCst?.id ?? null,
      cst_type: targetType,
      alias: generateAlias(targetType, schema),
      term_raw: '',
      definition_formal: definition ?? '',
      definition_raw: '',
      convention: '',
      crucial: false,
      term_forms: []
    });
    onCreateCst(response.new_cst);
    return response.new_cst.id;
  }

  async function cloneCst(): Promise<number> {
    if (!activeCst) {
      throw new Error('No active cst');
    }
    const response = await createCstFromData({
      insert_after: activeCst.id,
      cst_type: activeCst.cst_type,
      alias: generateAlias(activeCst.cst_type, schema),
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      crucial: activeCst.crucial,
      term_forms: activeCst.term_forms
    });
    onCreateCst(response.new_cst);
    return response.new_cst.id;
  }

  function moveSelected(target: number) {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    setBundle(prev => sbApi.moveConstituents(prev!, {
      items: selectedCstInSchema,
      move_to: target
    } satisfies MoveConstituentsDTO));
  }

  function moveUp() {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCstInSchema.includes(cst.id)) {
        return prev;
      }
      if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1);
    moveSelected(target);
  }

  function moveDown() {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCstInSchema.includes(cst.id)) {
        return prev;
      }
      count += 1;
      if (prev === -1) {
        return index;
      }
      return Math.max(prev, index);
    }, -1);
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2);
    moveSelected(target);
  }

  function toggleCrucial() {
    if (!activeCst || selectedCstInSchema.length === 0) {
      return;
    }
    setBundle(prev => sbApi.updateCrucial(prev!, {
      target: selectedCstInSchema,
      value: !activeCst.crucial
    }));
  }

  function patchConstituenta(data: UpdateConstituentaDTO): Promise<RO<RSFormDTO>> {
    let nextSchema: RO<RSFormDTO> | null = null;
    setBundle(prev => {
      const next = sbApi.updateConstituenta(prev!, data);
      nextSchema = next.rsform;
      return next;
    });
    if (!nextSchema) {
      throw new Error('Sandbox bundle is not available');
    }
    return Promise.resolve(nextSchema);
  }

  function createCstFromData(data: CreateConstituentaDTO): Promise<RO<ConstituentaCreatedResponse>> {
    let response: RO<ConstituentaCreatedResponse> | null = null;
    setBundle(prev => {
      const result = sbApi.createConstituenta(prev!, data);
      response = {
        new_cst: result.newCst,
        schema: result.bundle.rsform
      };
      return result.bundle;
    });
    if (!response) {
      throw new Error('Sandbox bundle is not available');
    }
    return Promise.resolve(response);
  }

  function addAttribution(containerID: number, attributeID: number) {
    setBundle(prev => sbApi.createAttribution(prev!, {
      container: containerID,
      attribute: attributeID
    }));
  }

  function removeAttribution(attribute: Constituenta) {
    if (!activeCst) {
      return;
    }
    setBundle(prev => sbApi.deleteAttribution(prev!, {
      container: activeCst.id,
      attribute: attribute.id
    }));
  }

  function clearAttributions() {
    if (!activeCst) {
      return;
    }
    setBundle(prev => sbApi.clearAttributions(prev!, {
      target: activeCst.id
    }));
  }

  function openTermEditor() {
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({
      target: activeCst,
      onSave: data => {
        void patchConstituenta(data);
      }
    });
  }

  function promptRename() {
    if (!activeCst) {
      return;
    }
    showRenameCst({
      schema,
      target: activeCst,
      onRename: data => {
        void patchConstituenta(data);
      }
    });
  }

  function deleteSelectedCst() {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    showDeleteCst({
      schema,
      selected: selectedCstInSchema,
      onDelete: deleted => {
        setBundle(prev => sbApi.deleteConstituents(prev!, deleted));
        const nextActive = getNextActiveOnDelete(activeCst?.id ?? null, schema.items, deleted);
        setSelectedEdges([]);
        setSelectedCst(nextActive ? [nextActive] : []);
        if (nextActive !== null) {
          router.changeActive(nextActive);
        }
      }
    });
  }

  function deleteSelectedEdge() {
    if (selectedEdges.length !== 1) {
      return;
    }
    const [sourceRaw, targetRaw] = selectedEdges[0].split('==');
    const sourceID = Number(sourceRaw);
    const targetID = Number(targetRaw);
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
      setBundle(prev => sbApi.deleteAttribution(prev!, {
        container: sourceID,
        attribute: targetID
      }));
      setSelectedEdges([]);
      return;
    }
    if (schema.graph.hasEdge(sourceID, targetID)) {
      if (targetCst.is_inherited) {
        toast.error(errorMsg.changeInheritedDefinition);
        return;
      }
      void patchConstituenta({
        target: targetID,
        item_data: {
          definition_formal: removeAliasReference(targetCst.definition_formal, sourceCst.alias)
        }
      });
      setSelectedEdges([]);
      return;
    }
    throw new Error('Graph edge not found');
  }

  function promptDeleteSelected() {
    if (!canDeleteSelected) {
      return;
    }
    if (selectedCstInSchema.length > 0) {
      deleteSelectedCst();
    } else if (selectedEdges.length === 1) {
      deleteSelectedEdge();
    }
  }

  function promptTemplate() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCstTemplate({
      schema,
      insertAfter: activeCst?.id,
      onCreate: value => {
        void createCstFromData(value).then(response => onCreateCst(response.new_cst));
      }
    });
  }

  function deselectAll() {
    setSelectedCst([]);
    setSelectedEdges([]);
  }

  function gotoPredecessor(target: number, newTab?: boolean) {
    if (!schema.cstByID.has(target)) {
      return;
    }
    router.gotoEditActive(target, newTab);
  }

  return (
    <RSEditContext
      value={{
        schema,
        focusCst,
        selectedCst: selectedCstInSchema,
        selectedEdges,
        activeCst,
        pendingActiveID,

        isOwned: true,
        isArchive: false,
        isMutable: true,
        isContentEditable: true,
        canDeleteSelected,
        isProcessing: false,

        deleteSchema: notImplemented,

        patchConstituenta,
        openTermEditor,
        promptRename,
        addAttribution,
        removeAttribution,
        clearAttributions,
        gotoPredecessor,

        setFocus: handleSetFocus,
        clearPendingActiveID: function clearPendingActiveID() {
          setPendingActiveID(null);
        },
        setSelectedCst,
        setSelectedEdges,
        selectCst: function selectCst(target: number) {
          setSelectedCst(prev => [...prev, target]);
        },
        deselectCst: function deselectCst(target: number) {
          setSelectedCst(prev => prev.filter(id => id !== target));
        },
        toggleSelectCst: function toggleSelectCst(target: number) {
          setSelectedCst(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target]));
        },
        deselectAll,

        moveUp,
        moveDown,
        toggleCrucial,
        createCst,
        createCstFromData,
        promptCreateCst,
        cloneCst,
        promptDeleteSelected,
        promptTemplate
      }}
    >
      {children}
    </RSEditContext>
  );
}

function getNextActiveOnDelete(activeID: number | null, items: Constituenta[], deleted: number[]): number | null {
  if (items.length === deleted.length) {
    return null;
  }

  let activeIndex = items.findIndex(cst => cst.id === activeID);
  if (activeIndex === -1) {
    return null;
  }

  while (activeIndex < items.length && deleted.includes(items[activeIndex].id)) {
    activeIndex += 1;
  }
  if (activeIndex >= items.length) {
    activeIndex = items.length - 1;
    while (activeIndex >= 0 && deleted.includes(items[activeIndex].id)) {
      activeIndex -= 1;
    }
  }
  return activeIndex >= 0 ? items[activeIndex].id : null;
}
