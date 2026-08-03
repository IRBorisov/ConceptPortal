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
        The Graph tab opens the <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} />: constituent links by
        formal definition and attribution — useful to see the schema structure as a whole.
      </p>
    )
  },
  tools: {
    title: 'Modes and selection',
    body: (
      <>
        <p>
          When editing is allowed, the top bar shows{' '}
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Mode: Browse — navigate and select;{' '}
          <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Mode: Editor — draw
          relations. In editor mode for attributive schemas,{' '}
          <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> chooses the type of the link being
          drawn.
        </p>
        <p>
          In the “Expand from selection…” menu — <IconGraphCollapse className='inline-icon' /> Influencers and{' '}
          <IconGraphExpand className='inline-icon' /> Dependents; the menu needs a non-empty selection.
        </p>
      </>
    )
  },
  options: {
    title: 'View and filters',
    body: (
      <>
        <p>
          On the left — node coloring and, for attributive schemas, a display filter for link types.{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) fits the graph to the screen;{' '}
          <IconFocus className='inline-icon' /> focuses one constituent (or right-click a node);{' '}
          <IconFilter className='inline-icon' /> opens view settings.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) toggles labels; <IconClustering className='inline-icon' />{' '}
          (<kbd>B</kbd>) hides derived nodes; <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>)
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
        <IconTypeGraph className='inline-icon' /> opens the echelon graph of selected constituents.
      </p>
    )
  },
  hidden: {
    title: 'Hidden nodes',
    body: (
      <p>
        Constituents filtered out of the canvas appear in the Hidden list. Click to select; double-click to open
        constituent editing.
      </p>
    )
  },
  canvas: {
    title: 'Nodes and navigation',
    body: (
      <>
        <p>
          Click a node to select it; double-click opens constituent editing. Pan with <kbd>Space</kbd> or{' '}
          <kbd>WASD</kbd>, zoom with the mouse wheel.
        </p>
        <p>
          <kbd>Esc</kbd> clears the selection; <kbd>Delete</kbd> removes selected constituents when editing is allowed.
        </p>
      </>
    )
  }
};
