import { HelpTopic } from '@/features/help';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const formulaTreeContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Syntax tree',
    body: (
      <p>
        The <TourHelpLink text='syntax tree' topic={HelpTopic.UI_FORMULA_TREE} /> shows how the expression is built.
        Hover a node to highlight its fragment in the banner above; typification appears in the node tooltip.
      </p>
    )
  },
  canvas: {
    title: 'Navigate the tree',
    body: (
      <p>
        Click a node to select a subexpression. Hold <kbd>Space</kbd> to move the view without hovering nodes; zoom with
        the mouse wheel. Node colors mark language roles (logic, identifiers, typed and compound expressions) — see the
        full list in the <TourHelpLink text='help' topic={HelpTopic.UI_FORMULA_TREE} />.
      </p>
    )
  },
  extract: {
    title: 'Extract a constituent',
    body: (
      <>
        <p>
          Available for a nested node with children (not the root); in view-only mode the button is unavailable. Select
          such a node, then press <kbd>Q</kbd> or click <IconNewItem className='inline-icon' /> Extract to open the
          extraction panel and pull that subexpression into a new constituent. Press <kbd>Q</kbd> again to close the
          panel.
        </p>
        <p>
          In the extraction panel, fill in the new term (and optional new textual definition), then confirm with{' '}
          <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> closes the panel without extracting.
        </p>
      </>
    )
  }
};
