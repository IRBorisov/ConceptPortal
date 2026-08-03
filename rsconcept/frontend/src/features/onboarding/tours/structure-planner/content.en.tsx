import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Structure expansion',
    body: (
      <>
        <p>
          <TourHelpLink text='Structure expansion' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> shows an operation graph
          from the typification of the selected constituent (projections, set-sum, and so on). For a generated
          constituent, the root is the structure of the basis.
        </p>
        <p>
          Each node circle shows a name; below it — the term or type. Colors: purple — root, green — constituent
          already exists, orange — needs to be created. Click a node to select that structural element.
        </p>
      </>
    )
  },
  panel: {
    title: 'Definition, term, and save',
    body: (
      <>
        <p>
          The top panel shows the formal definition of the selected node, its name (alias) — green when new — and the
          term field with text-reference support. Existing constituents load their saved term; for a new node the name
          is assigned automatically, and you enter the term in the field.
        </p>
        <p>
          When editing is allowed, <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> saves or creates — from the term field,{' '}
          <kbd>{saveHotkey}</kbd> does the same. <IconReset className='inline-icon icon-primary' /> discards term edits
          only for an existing constituent. Switching nodes with unsaved edits prompts you first.
        </p>
      </>
    )
  }
};
