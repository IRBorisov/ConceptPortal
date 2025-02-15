'use client';

import { useLayoutEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useAppLayoutStore, useFitHeight } from '@/stores/appLayout';
import { resources } from '@/utils/constants';

export function Component() {
  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const panelHeight = useFitHeight('0px');

  useLayoutEffect(() => {
    hideFooter(true);
    return () => hideFooter(false);
  }, [hideFooter]);

  return (
    <div className='cc-fade-in flex justify-center overflow-hidden' style={{ maxHeight: panelHeight }}>
      <TransformWrapper>
        <TransformComponent>
          <img alt='Схема базы данных' src={resources.db_schema} className='w-fit h-fit' />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
