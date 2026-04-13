'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { RSEngine } from '@/domain/library';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { RSEditState } from '@/features/rsform/pages/rsform-page/rsedit-state';
import { useRoleStore, UserRole } from '@/features/users';

import { errorMsg, infoMsg, promptText } from '@/utils/labels';

import { useClearValues } from '../../backend/use-clear-values';
import { useMutatingRSModel } from '../../backend/use-mutating-rsmodel';
import { useRSModel } from '../../backend/use-rsmodel';
import { useSetValue } from '../../backend/use-set-value';

import { RSModelContext } from './rsmodel-context';

interface RSModelStateProps {
  itemID: number;
}

export const RSModelState = ({ itemID, children }: React.PropsWithChildren<RSModelStateProps>) => {
  const router = useConceptNavigation();
  const { model } = useRSModel({ itemID });
  const { user } = useAuth();
  const { schema } = useRSForm({ itemID: model.schema });
  const { setCstValue } = useSetValue();
  const { clearValues } = useClearValues();

  const [engine] = useState<RSEngine>(
    () =>
      new RSEngine(
        model.id,
        {
          setCstValue,
          clearValues
        },
        {
          onInvalidSetValue: () => toast.error(errorMsg.invalidSetValue),
          onCalculationSuccess: timeSpent => toast.success(infoMsg.calculationSuccess(timeSpent)),
          onEvaluationError: message => toast.error(message)
        }
      )
  );

  useEffect(
    function syncServices() {
      engine.updateServices({ setCstValue, clearValues });
      engine.updateNotifications({
        onInvalidSetValue: () => toast.error(errorMsg.invalidSetValue),
        onCalculationSuccess: timeSpent => toast.success(infoMsg.calculationSuccess(timeSpent)),
        onEvaluationError: message => toast.error(message)
      });
    },
    [engine, setCstValue, clearValues]
  );

  useEffect(
    function syncData() {
      engine.loadData(schema, model);
    },
    [engine, schema, model]
  );

  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const isMutable = role > UserRole.READER && !schema.read_only;
  const isOwned = !!user.id && user.id === model.owner;

  const setCurrentModel = useAIStore(state => state.setModel);
  const onSetModel = useEffectEvent(setCurrentModel);
  const { deleteItem } = useDeleteItem();
  const isProcessing = useMutatingRSModel();

  useEffect(
    function syncGlobalModel() {
      onSetModel(model);
      return () => onSetModel(null);
    },
    [model]
  );

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

  return (
    <RSModelContext
      value={{
        model,
        schema,
        isMutable,
        isOwned,
        engine,
        deleteModel
      }}
    >
      <RSEditState itemID={model.schema} isProcessing={isProcessing}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
