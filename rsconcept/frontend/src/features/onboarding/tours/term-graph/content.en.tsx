import { HelpTopic } from '@/features/help';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import {
  IconClustering,
  IconCrucial,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphExpand,
  IconImage,
  IconNewItem,
  IconOverviewCore,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const termGraphContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Term graph',
    body: (
      <p>
        The <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} /> shows constituent links by formal
        definition and attribution — useful to see the schema structure as a whole.
      </p>
    )
  },
  options: {
    title: 'View and filters',
    body: (
      <>
        <p>
          On the left — node coloring and link types. <IconFitImage className='inline-icon' /> fits the graph;{' '}
          <IconFocus className='inline-icon' /> focuses one constituent; <IconFilter className='inline-icon' /> opens
          layout and filter settings.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) toggles labels; <IconClustering className='inline-icon' />{' '}
          (<kbd>V</kbd>) hides generated nodes; <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>)
          shows the axiomatic core only; <IconImage className='inline-icon' /> exports PNG or SVG.
        </p>
        <p>
          Try it: toggle <IconText className='inline-icon' /> labels with the highlighted button. The guide continues
          automatically.
        </p>
      </>
    )
  },
  edit: {
    title: 'Edit nodes',
    body: (
      <p>
        When editing is allowed, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) creates a constituent
        with links to the selected nodes; <IconDestroy className='inline-icon icon-red' /> deletes the selection;{' '}
        <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) toggles the crucial status;{' '}
        <IconTypeGraph className='inline-icon' /> opens the type graph for the selection.
      </p>
    )
  },
  hidden: {
    title: 'Hidden nodes',
    body: (
      <p>
        Constituents filtered out of the canvas appear in the hidden list. Click to select; double-click to open the
        concept editor.
      </p>
    )
  },
  tools: {
    title: 'Modes and selection',
    body: (
      <>
        <p>
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Browse — navigate and select;{' '}
          <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Editor — draw relations.{' '}
          <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> attribution /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> definition.
        </p>
        <p>
          Helpers expand related nodes — for example <IconGraphCollapse className='inline-icon' /> all influencers and{' '}
          <IconGraphExpand className='inline-icon' /> all dependents.
        </p>
      </>
    )
  },
  canvas: {
    title: 'Nodes and navigation',
    body: (
      <>
        <p>
          Click a node to select it; double-click opens the concept editor. Pan with <kbd>Space</kbd> or <kbd>WASD</kbd>
          , zoom with the mouse wheel.
        </p>
        <p>
          <kbd>Esc</kbd> clears the selection; <kbd>Delete</kbd> removes selected constituents when editing is allowed.
        </p>
      </>
    )
  }
};
