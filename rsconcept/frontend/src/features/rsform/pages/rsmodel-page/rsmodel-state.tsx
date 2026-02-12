'use client';

import { useRSModelSuspense } from '../../backend/use-rsmodel';
import { RSEditState } from '../rsform-page/rsedit-state';

import { RSModelContext } from './rsmodel-context';

interface RSModelStateProps {
  itemID: number;
}

export const RSModelState = ({
  itemID,
  children
}: React.PropsWithChildren<RSModelStateProps>) => {
  const { model } = useRSModelSuspense({ itemID: itemID });

  return (
    <RSModelContext
      value={{
        model
      }}
    >
      <RSEditState itemID={model.schema}>
        {children}
      </RSEditState>
    </RSModelContext>
  );
};
