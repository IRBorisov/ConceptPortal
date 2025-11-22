import { useReactFlow, useStoreApi } from 'reactflow';

import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';
import { promptText } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { OperationType } from '../../../backend/types';
import { useDeleteBlock } from '../../../backend/use-delete-block';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { type IOssItem, NodeType } from '../../../models/oss';
import { LayoutManager } from '../../../models/oss-layout-api';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { useOssFlow } from './oss-flow-context';
import { useGetLayout } from './use-get-layout';

export function useHandleActions() {
  const { screenToFlowPosition } = useReactFlow();
  const { schema, selected, setSelected, selectedItems, isMutable, deselectAll, canDeleteOperation } = useOssEdit();
  const { resetView, resetGraph } = useOssFlow();
  const isProcessing = useMutatingOss();
  const store = useStoreApi();
  const { resetSelectedElements } = store.getState();
  const toggleShowSidePanel = usePreferencesStore(state => state.toggleShowOssSidePanel);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { deleteBlock } = useDeleteBlock();

  const showCreateOperation = useDialogsStore(state => state.showCreateSynthesis);
  const showCreateBlock = useDialogsStore(state => state.showCreateBlock);
  const showCreateSchema = useDialogsStore(state => state.showCreateSchema);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showDeleteReference = useDialogsStore(state => state.showDeleteReference);
  const showImportSchema = useDialogsStore(state => state.showImportSchema);
  const showOptions = useDialogsStore(state => state.showOssOptions);

  function handleShowSidePanel() {
    toggleShowSidePanel();
  }

  function handleShowOptions() {
    showOptions();
  }

  function handleToggleGrid() {
    toggleShowGrid();
  }

  function handleToggleEdge() {
    toggleEdgeStraight();
  }

  function handleSavePositions() {
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleCreateSynthesis() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateOperation({
      ossID: schema.id,
      layout: getLayout(),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialInputs: selectedItems.filter(item => item?.nodeType === NodeType.OPERATION).map(item => item.id),
      initialParent: extractBlockParent(selectedItems),
      onCreate: newID => {
        resetView();
        setTimeout(() => setSelected([`o${newID}`]), PARAMETER.minimalTimeout);
      }
    });
  }

  function handleCreateBlock() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const parent = extractBlockParent(selectedItems);
    const needChildren = parent === null || selectedItems.length !== 1 || parent !== selectedItems[0].id;
    showCreateBlock({
      ossID: schema.id,
      layout: getLayout(),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      childrenBlocks: !needChildren
        ? []
        : selectedItems.filter(item => item.nodeType === NodeType.BLOCK).map(item => item.id),
      childrenOperations: !needChildren
        ? []
        : selectedItems.filter(item => item.nodeType === NodeType.OPERATION).map(item => item.id),
      initialParent: parent,
      onCreate: newID => {
        setTimeout(() => {
          resetView();
          setSelected([`b${newID}`]);
        }, PARAMETER.minimalTimeout);
      }
    });
  }

  function handleCreateSchema() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showCreateSchema({
      ossID: schema.id,
      layout: getLayout(),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialParent: extractBlockParent(selectedItems),
      onCreate: newID => {
        resetView();
        setTimeout(() => setSelected([`o${newID}`]), PARAMETER.minimalTimeout);
      }
    });
  }

  function handleImportSchema() {
    const targetPosition = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    showImportSchema({
      ossID: schema.id,
      layout: getLayout(),
      defaultX: targetPosition.x,
      defaultY: targetPosition.y,
      initialParent: extractBlockParent(selectedItems),
      onCreate: newID => {
        resetView();
        setTimeout(() => setSelected([`o${newID}`]), PARAMETER.minimalTimeout);
      }
    });
  }

  function handleDeleteSelected() {
    if (selected.length !== 1) {
      return;
    }
    const item = schema.itemByNodeID.get(selected[0]);
    if (!item) {
      return;
    }
    if (item.nodeType === NodeType.OPERATION) {
      if (!canDeleteOperation(item)) {
        return;
      }
      switch (item.operation_type) {
        case OperationType.REPLICA:
          showDeleteReference({
            ossID: schema.id,
            targetID: item.id,
            layout: getLayout(),
            beforeDelete: deselectAll
          });
          break;
        case OperationType.INPUT:
        case OperationType.SYNTHESIS:
          showDeleteOperation({
            ossID: schema.id,
            targetID: item.id,
            layout: getLayout(),
            beforeDelete: deselectAll
          });
      }
    } else {
      if (!window.confirm(promptText.deleteBlock)) {
        return;
      }
      void deleteBlock({
        itemID: schema.id,
        data: { target: item.id, layout: getLayout() },
        beforeUpdate: deselectAll
      });
    }
  }

  function handleSelectLeft() {
    const selectedOperation = selectedItems.find(item => item.nodeType === NodeType.OPERATION);
    if (!selectedOperation) {
      return;
    }
    const manager = new LayoutManager(schema, getLayout());
    const newNodeID = manager.selectLeft(selectedOperation.nodeID);
    if (newNodeID) {
      setSelected([newNodeID]);
    }
  }

  function handleSelectRight() {
    const selectedOperation = selectedItems.find(item => item.nodeType === NodeType.OPERATION);
    if (!selectedOperation) {
      return;
    }
    const manager = new LayoutManager(schema, getLayout());
    const newNodeID = manager.selectRight(selectedOperation.nodeID);
    if (newNodeID) {
      setSelected([newNodeID]);
    }
  }
  function handleSelectUp() {
    const selectedOperation = selectedItems.find(item => item.nodeType === NodeType.OPERATION);
    if (!selectedOperation) {
      return;
    }
    const manager = new LayoutManager(schema, getLayout());
    const newNodeID = manager.selectUp(selectedOperation.nodeID);
    if (newNodeID) {
      setSelected([newNodeID]);
    }
  }

  function handleSelectDown() {
    const selectedOperation = selectedItems.find(item => item.nodeType === NodeType.OPERATION);
    if (!selectedOperation) {
      return;
    }
    const manager = new LayoutManager(schema, getLayout());
    const newNodeID = manager.selectDown(selectedOperation.nodeID);
    if (newNodeID) {
      setSelected([newNodeID]);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.key === 'Escape') {
      withPreventDefault(resetSelectedElements)(event);
      return;
    }
    if (event.code === 'KeyG') {
      withPreventDefault(resetView)(event);
      return;
    }
    if (event.code === 'KeyV') {
      withPreventDefault(handleShowSidePanel)(event);
      return;
    }
    if (event.code === 'KeyZ') {
      withPreventDefault(resetGraph)(event);
      return;
    }
    if (event.code === 'KeyX') {
      withPreventDefault(handleToggleGrid)(event);
      return;
    }
    if (event.code === 'KeyT') {
      withPreventDefault(handleToggleEdge)(event);
      return;
    }

    if (!isMutable) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      withPreventDefault(handleSavePositions)(event);
      return;
    }
    if (event.code === 'Digit1') {
      withPreventDefault(handleCreateBlock)(event);
      return;
    }
    if (event.code === 'Digit2') {
      withPreventDefault(handleCreateSynthesis)(event);
      return;
    }
    if (event.code === 'Digit3') {
      withPreventDefault(handleImportSchema)(event);
      return;
    }
    if (event.code === 'Digit4') {
      withPreventDefault(handleCreateSynthesis)(event);
      return;
    }

    if (event.code === 'Delete' || event.code === 'Backquote') {
      withPreventDefault(handleDeleteSelected)(event);
      return;
    }

    if (event.code === 'ArrowLeft') {
      withPreventDefault(handleSelectLeft)(event);
      return;
    }
    if (event.code === 'ArrowRight') {
      withPreventDefault(handleSelectRight)(event);
      return;
    }
    if (event.code === 'ArrowUp') {
      withPreventDefault(handleSelectUp)(event);
      return;
    }
    if (event.code === 'ArrowDown') {
      withPreventDefault(handleSelectDown)(event);
      return;
    }
  }

  return {
    handleKeyDown,

    handleToggleEdge,
    handleToggleGrid,
    handleFitView: resetView,
    handleSelectLeft,
    handleSelectRight,
    handleSelectUp,
    handleSelectDown,
    handleSavePositions,
    handleCreateSynthesis,
    handleCreateBlock,
    handleCreateSchema,
    handleImportSchema,
    handleDeleteSelected,
    handleResetPositions: resetGraph,
    handleShowOptions,
    handleShowSidePanel
  };
}

// -------- Internals --------
function extractBlockParent(selectedItems: IOssItem[]): number | null {
  if (selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK) {
    return selectedItems[0].id;
  }
  const parents = selectedItems.map(item => item.parent).filter(id => id !== null);
  return parents.length === 0 ? null : parents[0];
}
