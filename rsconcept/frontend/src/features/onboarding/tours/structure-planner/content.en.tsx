import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Structure planner',
    body: (
      <p>
        The <TourHelpLink text='structure planner' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> builds an operation graph
        from the typification of the open constituent (projections, set-sum, and so on). Click a node to work on that
        structural element.
      </p>
    )
  },
  panel: {
    title: 'Definition, term, and save',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The top panel shows the formal definition of the selected node, its alias (green when new), and the term field
          with text-reference support. Existing constituents load their term; empty nodes get a suggested name for a new
          one.
        </p>
        <p>
          When editing is allowed, <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> saves or creates — from the term field,{' '}
          <kbd>{saveHotkey}</kbd> does the same. <IconReset className='inline-icon icon-primary' /> discards unsaved
          edits.
        </p>
      </div>
    )
  }
};
