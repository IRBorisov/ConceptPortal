'use client';

import { useTx } from '@/app/i18n/use-tx';

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

  const toggleOnShort = tx('ui.oss.settings.toggleOnShort', 'On');
  const toggleOffShort = tx('ui.oss.settings.toggleOffShort', 'Off');

  return (
    <ModalView
      header={tx('ui.oss.settings.header', 'Display settings')}
      className='cc-column justify-between px-6 pb-3 w-100'
    >
      <Checkbox
        value={showCoordinates}
        onChange={toggleShowCoordinates}
        aria-label={tx('ui.oss.settings.coordsToggleAria', 'Toggle node coordinates visibility')}
        label={tx('ui.oss.settings.coordsLabel', 'Node coordinates: {state}', {
          state: showCoordinates ? toggleOnShort : toggleOffShort
        })}
        customIcon={checked => <IconCoordinates size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={showGrid}
        onChange={toggleShowGrid}
        aria-label={tx('ui.oss.settings.gridToggleAria', 'Toggle grid visibility')}
        title={prepareTooltip(tx('ui.oss.settings.gridToggleTitle', 'Toggle grid visibility'), 'X')}
        label={tx('ui.oss.settings.gridLabel', 'Grid display: {state}', {
          state: showGrid ? toggleOnShort : toggleOffShort
        })}
        customIcon={checked => <IconGrid size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={edgeAnimate}
        onChange={toggleEdgeAnimate}
        aria-label={tx('ui.oss.settings.edgeAnimateAria', 'Toggle edge animation')}
        label={tx('ui.oss.settings.edgeAnimateLabel', 'Edge animation: {state}', {
          state: edgeAnimate ? toggleOnShort : toggleOffShort
        })}
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
        aria-label={tx('ui.oss.settings.edgeShapeAria', 'Toggle edge shape')}
        title={prepareTooltip(tx('ui.oss.settings.edgeShapeTitle', 'Toggle edge shape'), 'T')}
        label={tx('ui.oss.settings.edgeShapeLabel', 'Edges: {shape}', {
          shape: edgeStraight
            ? tx('ui.oss.settings.edgeStraight', 'Straight')
            : tx('ui.oss.settings.edgeBezier', 'Bezier')
        })}
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
