'use client';

import { useEffect, useMemo } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { RSEditState } from '@/features/rsform/pages/rsform-page/rsedit-state';
import { useRoleStore, UserRole } from '@/features/users';

import { promptText } from '@/utils/labels';

import { useClearValues } from '../../backend/use-clear-values';
import { useRSModel } from '../../backend/use-rsmodel';
import { useSetValue } from '../../backend/use-set-value';
import { RSEngine } from '../../models/rsengine';

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

  const engine = useMemo(
    () => new RSEngine(model.id, {
      setCstValue,
      clearValues
    }),
    [model.id, setCstValue, clearValues]
  );

  useEffect(() => {
    engine.loadData(schema, model);
  }, [engine, schema, model]);

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

  return (
    <RSModelContext
      value={{
        model,
        schema,
        isMutable,
        isOwned,
        engine,
        deleteModel,
      }}
    >
      <RSEditState itemID={model.schema}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
