'use client';

import { useEffect } from 'react';

import { useAIStore } from '@/features/ai/stores/ai-context';
import { useRoleStore, UserRole } from '@/features/users';

import { RSModelLoader } from '../../backend/rsmodel-loader';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { useRSModelSuspense } from '../../backend/use-rsmodel';
import { RSEditState } from '../rsform-page/rsedit-state';

import { RSModelContext } from './rsmodel-context';

interface RSModelStateProps {
  itemID: number;
}

export const RSModelState = ({ itemID, children }: React.PropsWithChildren<RSModelStateProps>) => {
  const { model: modelData } = useRSModelSuspense({ itemID: itemID });
  const { schema } = useRSFormSuspense({ itemID: modelData.schema.id });
  const model = new RSModelLoader(modelData, schema).produce();

  const role = useRoleStore(state => state.role);
  const isMutable = role > UserRole.READER && !schema.read_only;

  const setCurrentModel = useAIStore(state => state.setModel);

  useEffect(() => {
    setCurrentModel(model);
    return () => setCurrentModel(null);
  }, [model, setCurrentModel]);

  return (
    <RSModelContext
      value={{
        model,
        isMutable
      }}
    >
      <RSEditState itemID={modelData.schema.id}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
