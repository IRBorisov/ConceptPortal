'use client';

import { useEffectEvent, useLayoutEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useAppLayoutStore, useFitHeight } from '@/stores/app-layout';
import { resources } from '@/utils/constants';

export function Component() {
  const hideFooter = useAppLayoutStore(state => state.hideFooter);
  const onHideFooterEvent = useEffectEvent(hideFooter);
  const panelHeight = useFitHeight('0px');

  useLayoutEffect(function hideFooterOnMount() {
    onHideFooterEvent(true);
    return () => onHideFooterEvent(false);
  }, []);

  return (
    <div className='relative w-full' style={{ height: panelHeight }}>
      <TransformWrapper>
        <TransformComponent wrapperClass='!w-full !h-full' contentClass='flex justify-center items-center'>
          <img alt='Схема базы данных' src={resources.db_schema} className='w-fit h-fit' />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
