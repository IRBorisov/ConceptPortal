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
        The <TourHelpLink text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} /> is where you compose operational synthesis:
        blocks, input schemas, synthesis nodes, and replicas. The passport only describes the OSS; structure lives here.
      </p>
    )
  },
  view: {
    title: 'View controls',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) resets unsaved layout moves;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) fits the graph;{' '}
          <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) toggles the contents
          sidebar; <IconSettings className='inline-icon' /> opens grid, line, and animation options;{' '}
          <IconImage className='inline-icon' /> exports PNG or SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Create and edit nodes',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          When editing is allowed, <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) saves node positions;{' '}
          <IconEdit2 className='inline-icon' /> opens the same menu as a right-click on the selected node;{' '}
          <IconNewItem className='inline-icon icon-green' /> adds a{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> block, empty schema, imported schema, or{' '}
          <IconSynthesis className='inline-icon' /> synthesis node; <IconDestroy className='inline-icon icon-red' />{' '}
          deletes the selection.
        </p>
        <p>
          The context menu also covers activate, replica, clone CS, relocate constituents, and open linked schemas — see
          the <TourHelpLink text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} /> manual.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Canvas interactions',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click a node to select it; <kbd>Shift</kbd>-click extends the selection. Double-click opens the linked
          conceptual schema (or the block editor). Drag nodes to rearrange; drag from a handle into a synthesis node to
          connect an argument.
        </p>
        <p>
          Pan with <kbd>Space</kbd>, zoom with the wheel, clear selection with <kbd>Esc</kbd>, and delete with{' '}
          <kbd>Delete</kbd> when editing is allowed.
        </p>
      </div>
    )
  },
  sidebar: {
    title: 'Contents sidebar',
    body: (
      <p>
        <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) toggles the{' '}
        <TourHelpLink text='contents sidebar' topic={HelpTopic.UI_OSS_SIDEBAR} />: edit constituents of the selected
        operation&apos;s schema without leaving the OSS — filter, create, clone, delete, reorder, and open term or type
        graphs. Select an operation with a linked CS so the panel has something to show.
      </p>
    )
  }
};
