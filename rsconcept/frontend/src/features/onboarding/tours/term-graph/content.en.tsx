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
        The <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} /> shows how constituents relate: which
        definitions depend on which. Use it to see the structure of the schema as a whole.
      </p>
    )
  },
  options: {
    title: 'View and filters',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          On the left, choose node coloring and link types. <IconFitImage className='inline-icon' /> fits the graph;{' '}
          <IconFocus className='inline-icon' /> focuses one constituent; <IconFilter className='inline-icon' /> opens
          layout and filter settings.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) toggles labels;{' '}
          <IconClustering className='inline-icon' /> (<kbd>V</kbd>) hides generated nodes;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) shows the axiomatic core only;{' '}
          <IconImage className='inline-icon' /> exports PNG or SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Edit nodes',
    body: (
      <p>
        When editing is allowed, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) creates a
        constituent; <IconDestroy className='inline-icon icon-red' /> deletes the selection;{' '}
        <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) toggles crucial;{' '}
        <IconTypeGraph className='inline-icon' /> opens the type graph for the selection.
      </p>
    )
  },
  hidden: {
    title: 'Hidden nodes',
    body: (
      <p>
        Constituents filtered out of the canvas appear in the hidden list. Click an item to select it, or activate it to
        open the concept editor.
      </p>
    )
  },
  tools: {
    title: 'Modes and selection',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Explore to navigate and select;{' '}
          <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Edit to draw relations.
          Attribution and definition edges use <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' />.
        </p>
        <p>
          Selection helpers expand related nodes — for example <IconGraphCollapse className='inline-icon' /> influencers
          and <IconGraphExpand className='inline-icon' /> dependents.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Nodes and navigation',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click a node to select it; double-click opens the concept editor. Pan with <kbd>Space</kbd> or <kbd>WASD</kbd>
          , and zoom with the mouse wheel.
        </p>
        <p>
          <kbd>Esc</kbd> clears the selection; <kbd>Delete</kbd> removes selected constituents when editing is allowed.
        </p>
      </div>
    )
  }
};
