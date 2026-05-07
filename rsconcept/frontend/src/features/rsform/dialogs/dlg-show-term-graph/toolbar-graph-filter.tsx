'use client';

import { useReactFlow } from '@xyflow/react';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconClustering, IconClusteringOff, IconFitImage, IconText, IconTextOff } from '@/components/icons';
import { PARAMETER } from '@/utils/constants';

import { useTermGraphStore } from '../../stores/term-graph';

import { flowOptions } from './tg-readonly-flow';

export default function ToolbarGraphFilter() {
  const tx = useTx();
  const filter = useTermGraphStore(state => state.filter);
  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);
  const { fitView } = useReactFlow();

  function handleFitView() {
    setTimeout(function fitViewAfterToolbarAction() {
      void fitView(flowOptions.fitViewOptions);
    }, PARAMETER.minimalTimeout);
  }

  return (
    <div className='flex flex-row gap-2'>
      <MiniButton
        title={tx('tx.flow.fitView')}
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        onClick={handleFitView}
      />
      <MiniButton
        title={!filter.noText ? tx('tx.general.labels.hide') : tx('tx.general.labels.show')}
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
        title={!filter.foldDerived ? tx('tx.cst.spawned.hide') : tx('tx.cst.spawned.show')}
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
