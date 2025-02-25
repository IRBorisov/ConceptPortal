'use client';

import React, { Suspense } from 'react';

import { Tooltip } from '@/components/Container';
import { Loader } from '@/components/Loader';
import { useTooltipsStore } from '@/stores/tooltips';
import { globalIDs } from '@/utils/constants';

const InfoConstituenta = React.lazy(() =>
  import('@/features/rsform/components/InfoConstituenta').then(module => ({ default: module.InfoConstituenta }))
);

const InfoOperation = React.lazy(() =>
  import('@/features/oss/components/InfoOperation').then(module => ({ default: module.InfoOperation }))
);

export const GlobalTooltips = () => {
  const hoverCst = useTooltipsStore(state => state.activeCst);
  const hoverOperation = useTooltipsStore(state => state.activeOperation);

  return (
    <>
      <Tooltip
        float
        id={globalIDs.tooltip}
        layer='z-topmost'
        place='right-start'
        className='mt-8 max-w-[20rem] break-words'
      />
      <Tooltip
        float
        id={globalIDs.value_tooltip}
        layer='z-topmost'
        className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
      />
      <Tooltip
        clickable
        id={globalIDs.constituenta_tooltip}
        layer='z-topmost'
        className='max-w-[30rem]'
        hidden={!hoverCst}
      >
        <Suspense fallback={<Loader />}>
          {hoverCst ? <InfoConstituenta data={hoverCst} onClick={event => event.stopPropagation()} /> : null}
        </Suspense>
      </Tooltip>
      <Tooltip
        id={globalIDs.operation_tooltip}
        layer='z-topmost'
        className='max-w-[35rem] max-h-[40rem] dense'
        hidden={!hoverOperation}
      >
        <Suspense fallback={<Loader />}>
          {hoverOperation ? <InfoOperation operation={hoverOperation} /> : null}
        </Suspense>
      </Tooltip>
    </>
  );
};
