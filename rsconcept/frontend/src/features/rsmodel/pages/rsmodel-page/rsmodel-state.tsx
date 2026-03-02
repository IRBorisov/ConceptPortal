'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { RSEditState } from '@/features/rsform/pages/rsform-page/rsedit-state';
import { useRoleStore, UserRole } from '@/features/users';

import { infoMsg, promptText } from '@/utils/labels';

import { RSModelLoader } from '../../backend/rsmodel-loader';
import { useRSModelSuspense } from '../../backend/use-rsmodel';
import { isInferrable } from '../../models/rsmodel-api';

import { RSModelContext } from './rsmodel-context';

interface RSModelStateProps {
  itemID: number;
}

export const RSModelState = ({ itemID, children }: React.PropsWithChildren<RSModelStateProps>) => {
  const router = useConceptNavigation();
  const { model: modelData } = useRSModelSuspense({ itemID: itemID });
  const { user } = useAuth();
  const { schema } = useRSForm({ itemID: modelData.schema.id });
  const model = new RSModelLoader(modelData, schema).produce();

  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const isMutable = role > UserRole.READER && !schema.read_only;
  const isOwned = !!user.id && user.id === model.owner;

  const setCurrentModel = useAIStore(state => state.setModel);
  const { deleteItem } = useDeleteItem();

  useEffect(() => {
    setCurrentModel(model);
    return () => setCurrentModel(null);
  }, [model, setCurrentModel]);

  function deleteModel() {
    if (!window.confirm(promptText.deleteLibraryItem)) {
      return;
    }
    void deleteItem({
      target: model.id,
      beforeInvalidate: () => {
        if (searchLocation === model.location) {
          setSearchLocation('');
        }
        return router.pushAsync({ path: urls.library, force: true });
      }
    });
  }

  function recalculateAll() {
    const startTime = performance.now();

    for (const cst of schema.cstByID.values()) {
      if (isInferrable(cst.cst_type)) {
        model.calculator.resetValue(cst.alias);
      }
    }

    try {
      for (const cstID of schema.graph.topologicalOrder()) {
        const cst = schema.cstByID.get(cstID)!;
        if (isInferrable(cst.cst_type)) {
          const parse = schema.analyzer.checkFull(cst.definition_formal);
          if (parse.success && parse.ast) {
            const result = model.calculator.evaluate(parse.ast);
            if (result.value) {
              model.calculator.setValue(cst.alias, result.value);
            }
          }
        }
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }

    const endTime = performance.now();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);

    toast.success(infoMsg.calculationSuccess(timeSpent));
  }

  return (
    <RSModelContext
      value={{
        model,
        isMutable,
        isOwned,

        deleteModel,
        recalculateAll
      }}
    >
      <RSEditState itemID={modelData.schema.id}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
