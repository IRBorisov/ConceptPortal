'use client';

import { useReactFlow } from '@xyflow/react';

import { MiniButton } from '@/components/control';
import { IconClustering, IconClusteringOff, IconFitImage, IconText, IconTextOff } from '@/components/icons';
import { PARAMETER } from '@/utils/constants';

import { useTermGraphStore } from '../../stores/term-graph';

import { flowOptions } from './tg-readonly-flow';

export default function ToolbarGraphFilter() {
  const filter = useTermGraphStore(state => state.filter);
  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);
  const { fitView } = useReactFlow();

  function handleFitView() {
    setTimeout(() => {
      void fitView(flowOptions.fitViewOptions);
    }, PARAMETER.minimalTimeout);
  }

  return (
    <div className='flex flex-row gap-2'>
      <MiniButton
        title='Граф целиком'
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        onClick={handleFitView}
      />
      <MiniButton
        title={!filter.noText ? 'Скрыть текст' : 'Отобразить текст'}
        icon={
          !filter.noText ? (
            <IconText size='1.25rem' className='icon-green' />
          ) : (
            <IconTextOff size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleText}
      />
      <MiniButton
        title={!filter.foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные'}
        icon={
          !filter.foldDerived ? (
            <IconClustering size='1.25rem' className='icon-green' />
          ) : (
            <IconClusteringOff size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleClustering}
      />
    </div>
  );
}
