import { HelpTopic } from '@/features/help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

import {
  IconConceptBlock,
  IconDestroy,
  IconEdit2,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings,
  IconSynthesis
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossGraphContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'OSS graph',
    body: (
      <p>
        On the <TourHelpLink text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} /> you assemble operational synthesis:
        blocks, inputs, synthesis nodes, and replicas.
      </p>
    )
  },
  view: {
    title: 'View controls',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) resets unsaved shifts;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) fits the graph;{' '}
          <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) opens the contents
          panel; <IconSettings className='inline-icon' /> — grid, lines, and animation;{' '}
          <IconImage className='inline-icon' /> — export PNG or SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Create and edit nodes',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          When editing is allowed, <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) saves positions;{' '}
          <IconEdit2 className='inline-icon' /> opens the same menu as right-click on the selected node;{' '}
          <IconNewItem className='inline-icon icon-green' /> adds a{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> block, empty schema, schema import, or{' '}
          <IconSynthesis className='inline-icon' /> synthesis; <IconDestroy className='inline-icon icon-red' /> deletes
          the selection.
        </p>
        <p>
          Context menu also covers activation, replica, schema clone, constituent transfer, and opening the linked
          schema — see the <TourHelpLink text='OSS graph manual' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Canvas interactions',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click selects a node; <kbd>Shift</kbd>-click extends the selection. Double-click opens the linked schema (or
          the block editor). Drag nodes; drag from a handle to a synthesis node to add an argument.
        </p>
        <p>
          Pan with <kbd>Space</kbd>, zoom with the wheel, clear selection with <kbd>Esc</kbd>, delete with{' '}
          <kbd>Delete</kbd> when editing is allowed.
        </p>
      </div>
    )
  },
  sidebar: {
    title: 'Contents panel',
    body: (
      <p>
        <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) opens the{' '}
        <TourHelpLink text='contents panel' topic={HelpTopic.UI_OSS_SIDEBAR} />: edit constituents of the selected
        operation&apos;s schema — filter, create, clone, delete, order, term graph and type graph. Select an operation
        with a linked schema to fill the panel.
      </p>
    )
  }
};
