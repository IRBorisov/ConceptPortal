'use client';

import { useEffectEvent, useLayoutEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useTx } from '@/app/i18n/use-tx';

import { useAppLayoutStore, useFitHeight } from '@/stores/app-layout';
import { resources } from '@/utils/constants';

export function Component() {
  const tx = useTx();
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
          <img alt={tx('ui.page.databaseSchema.imageAlt', 'Database schema')} src={resources.db_schema} className='w-fit h-fit' />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
