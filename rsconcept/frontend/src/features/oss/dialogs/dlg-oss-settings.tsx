'use client';

import { useTx } from '@/i18n';

import {
  IconAnimation,
  IconAnimationOff,
  IconCoordinates,
  IconGrid,
  IconLineStraight,
  IconLineWave
} from '@/components/icons';
import { Checkbox } from '@/components/input';
import { ModalView } from '@/components/modal';
import { prepareTooltip } from '@/utils/format';

import { useOSSGraphStore } from '../stores/oss-graph';

const ICON_SIZE = '1.5rem';

export function DlgOssSettings() {
  const tx = useTx();
  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleShowCoordinates = useOSSGraphStore(state => state.toggleShowCoordinates);
  const toggleEdgeAnimate = useOSSGraphStore(state => state.toggleEdgeAnimate);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  const toggleOn = tx('tx.general.on');
  const toggleOff = tx('tx.general.off');

  return (
    <ModalView header={tx('tx.general.settings')} className='cc-column justify-between px-6 pb-3 w-100'>
      <Checkbox
        value={showCoordinates}
        onChange={toggleShowCoordinates}
        aria-label={tx('tx.flow.coordinates.toggle')}
        label={`${tx('tx.flow.coordinates')}${tx('tx.general.colon')}${showCoordinates ? toggleOn : toggleOff}`}
        customIcon={checked => <IconCoordinates size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={showGrid}
        onChange={toggleShowGrid}
        aria-label={tx('tx.flow.grid.toggle')}
        title={prepareTooltip(tx('tx.flow.grid.toggle'), 'X')}
        label={`${tx('tx.flow.grid')}${tx('tx.general.colon')}${showGrid ? toggleOn : toggleOff}`}
        customIcon={checked => <IconGrid size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={edgeAnimate}
        onChange={toggleEdgeAnimate}
        aria-label={tx('tx.flow.animation.toggle')}
        label={`${tx('tx.flow.animation')}${tx('tx.general.colon')}${edgeAnimate ? toggleOn : toggleOff}`}
        customIcon={checked =>
          checked ? (
            <IconAnimation size={ICON_SIZE} className='icon-primary' />
          ) : (
            <IconAnimationOff size={ICON_SIZE} className='icon-primary' />
          )
        }
      />
      <Checkbox
        value={edgeStraight}
        onChange={toggleEdgeStraight}
        aria-label={tx('tx.flow.edge.shape.toggle')}
        title={prepareTooltip(tx('tx.flow.edge.shape.toggle'), 'T')}
        label={`${tx('tx.flow.edge.plural')}${tx('tx.general.colon')}${edgeStraight ? tx('tx.flow.edge.shape.straight') : tx('tx.flow.edge.shape.bezier')}`}
        customIcon={checked =>
          checked ? (
            <IconLineStraight size={ICON_SIZE} className='icon-primary' />
          ) : (
            <IconLineWave size={ICON_SIZE} className='icon-primary' />
          )
        }
      />
    </ModalView>
  );
}
