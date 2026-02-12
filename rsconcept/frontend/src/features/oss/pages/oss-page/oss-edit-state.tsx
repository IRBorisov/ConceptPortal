'use client';

import { useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuthSuspense } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRoleStore, UserRole } from '@/features/users';
import { useAdjustRole } from '@/features/users/stores/use-adjust-role';

import { usePreferencesStore } from '@/stores/preferences';
import { promptText } from '@/utils/labels';

import { OperationType } from '../../backend/types';
import { useOssSuspense } from '../../backend/use-oss';
import { NodeType, type Operation } from '../../models/oss';

import { OssEditContext } from './oss-edit-context';

interface OssEditStateProps {
  itemID: number;
}

export const OssEditState = ({ itemID, children }: React.PropsWithChildren<OssEditStateProps>) => {
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);

  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);
  const setCurrentOSS = useAIStore(state => state.setOSS);
  const setCurrentBlock = useAIStore(state => state.setBlock);
  const setCurrentOperation = useAIStore(state => state.setOperation);

  const { user } = useAuthSuspense();
  const { schema } = useOssSuspense({ itemID: itemID });

  const isOwned = !!user.id && user.id === schema.owner;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isEditor = !!user.id && schema.editors.includes(user.id);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const selectedItems = selectedNodes.map(id => schema.itemByNodeID.get(id)).filter(item => !!item);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  const { deleteItem } = useDeleteItem();

  useAdjustRole({
    isOwner: isOwned,
    isEditor: isEditor,
    isStaff: user.is_staff,
    adminMode: adminMode
  });

  function canDeleteOperation(target: Operation) {
    if (target.operation_type === OperationType.INPUT || target.operation_type === OperationType.REPLICA) {
      return true;
    }
    return schema.graph.expandOutputs([target.id]).length === 0;
  }

  const canDeleteSelected = (() => {
    if (!isMutable) { return false; }
    if (selectedNodes.length === 1) {
      const item = schema.itemByNodeID.get(selectedNodes[0]);
      if (item?.nodeType === NodeType.OPERATION) { return canDeleteOperation(item); }
      return true;
    }
    if (selectedEdges.length === 1) { return true; }
    return false;
  })();

  useEffect(() => {
    setCurrentOSS(schema);
    return () => setCurrentOSS(null);
  }, [schema, setCurrentOSS]);

  useEffect(() => {
    const selectedBlock = selectedItems.find(item => item.nodeType === NodeType.BLOCK);
    if (selectedBlock) {
      setCurrentBlock(selectedBlock);
      return () => setCurrentBlock(null);
    }
    setCurrentBlock(null);
  }, [selectedItems, setCurrentBlock]);

  useEffect(() => {
    const selectedOperation = selectedItems.find(item => item.nodeType === NodeType.OPERATION);
    if (selectedOperation) {
      setCurrentOperation(selectedOperation);
      return () => setCurrentOperation(null);
    }
    setCurrentOperation(null);
  }, [selectedItems, setCurrentOperation]);

  function deleteSchema() {
    if (!window.confirm(promptText.deleteOSS)) {
      return;
    }
    void deleteItem({
      target: schema.id,
      beforeInvalidate: () => {
        if (searchLocation === schema.location) {
          setSearchLocation('');
        }
        return router.pushAsync({ path: urls.library, force: true });
      }
    });
  }

  function deselectAll() {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }

  return (
    <OssEditContext
      value={{
        schema,
        selectedNodes,
        selectedEdges,
        selectedItems,
        canDeleteSelected,

        isOwned,
        isMutable,

        canDeleteOperation,
        deleteSchema,
        setSelectedNodes,
        setSelectedEdges,
        deselectAll
      }}
    >
      {children}
    </OssEditContext>
  );
};
