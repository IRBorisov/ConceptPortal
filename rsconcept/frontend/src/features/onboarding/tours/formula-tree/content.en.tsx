import { HelpTopic } from '@/features/help';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const formulaTreeContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Parse tree',
    body: (
      <p>
        The <TourHelpLink text='syntax tree' topic={HelpTopic.UI_FORMULA_TREE} /> shows how the expression is built.
        Hover a node to highlight its fragment in the banner above and see its typification.
      </p>
    )
  },
  canvas: {
    title: 'Navigate the tree',
    body: (
      <p>
        Click a node to select a subexpression. Hold <kbd>Space</kbd> to pan without hovering nodes; zoom with the mouse
        wheel. Node colors mark language roles (declarations, globals, logic, typed expressions, and so on).
      </p>
    )
  },
  extract: {
    title: 'Extract a constituent',
    body: (
      <>
        <p>
          When extraction is available, select a nested node (not the root), then press <kbd>Q</kbd> or click{' '}
          <IconNewItem className='inline-icon' /> Extract to pull that subexpression into a new constituent.
        </p>
        <p>
          In the extraction panel, fill in the term (and optional text definition), then confirm with{' '}
          <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> closes the panel without extracting.
        </p>
      </>
    )
  }
};
