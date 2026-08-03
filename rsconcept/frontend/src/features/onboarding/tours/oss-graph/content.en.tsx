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
        On the <TourHelpLink text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} /> you build an operational synthesis
        schema: blocks, inputs, synthesis nodes, and replicas. Metadata, access, and statistics are on the Passport tab.
      </p>
    )
  },
  view: {
    title: 'View controls',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) — Reset changes; <IconFitImage className='inline-icon' />{' '}
          (<kbd>G</kbd>) fits the graph to the screen; <IconSettings className='inline-icon' /> Settings: coordinates,
          grid (<kbd>X</kbd>), edge animation, edge shape (<kbd>T</kbd>); <IconImage className='inline-icon' /> — Save
          image (PNG or SVG).
        </p>
      </>
    )
  },
  edit: {
    title: 'Create and edit nodes',
    body: (
      <>
        <p>
          When editing is allowed, the second toolbar row: <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) —
          Save changes; <IconEdit2 className='inline-icon' /> opens the same menu as right-click on the selected node;{' '}
          <IconNewItem className='inline-icon icon-green' /> Add… —{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> new block, new CS, schema import, or{' '}
          <IconSynthesis className='inline-icon' /> synthesis; <IconDestroy className='inline-icon icon-red' /> deletes
          the selection. Without edit rights — see access in the passport.
        </p>
        <p>
          Context menu also covers Execute synthesis, Create replica, Clone, Constituents (
          <TourHelpLink text='relocate between schemas' topic={HelpTopic.UI_RELOCATE_CST} />), and opening the linked
          schema — see the <TourHelpLink text='OSS graph manual' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </>
    )
  },
  canvas: {
    title: 'Canvas interactions',
    body: (
      <>
        <p>
          Click selects a node; <kbd>Shift</kbd>-click extends the selection. Double-click opens the linked schema (or
          the block editor). Drag nodes; drag from a connection point to a synthesis node to add an argument.
        </p>
        <p>
          Pan with <kbd>Space</kbd>, zoom with the wheel, clear selection with <kbd>Esc</kbd>, delete with{' '}
          <kbd>Delete</kbd> when editing is allowed.
        </p>
      </>
    )
  },
  sidebar: {
    title: 'Contents panel',
    body: (
      <p>
        Press <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> or <kbd>V</kbd> to open the{' '}
        <TourHelpLink text='contents panel' topic={HelpTopic.UI_OSS_SIDEBAR} />: edit constituents of the selected
        operation&apos;s schema — filter, create, clone, delete, order, term graph and type graph. Select an operation
        with a linked schema to fill the panel.
      </p>
    )
  }
};
