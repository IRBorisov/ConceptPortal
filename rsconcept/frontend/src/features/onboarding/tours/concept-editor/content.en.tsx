import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Concept editor',
    body: (
      <p>
        Here a single constituent is edited in the{' '}
        <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />: its term, textual definition, and
        formal definition. Select constituents in the list to open them on this tab.
      </p>
    )
  },
  check: {
    title: 'Check and diagnostics',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          After editing a formal definition, the <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='definition status' topic={HelpTopic.UI_CST_STATUS} /> indicator turns blue until you run a
          check. Click it or press <kbd>Ctrl + Q</kbd> to validate the expression.
        </p>
        <p>
          If something is wrong, errors appear below the editor — click an error to jump to the problematic fragment in
          the expression. A <IconStatusOK className='inline-icon' /> green status means the definition is verified.
        </p>
      </div>
    )
  },
  tools: {
    title: 'Syntax tree and type graph',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The <IconTree className='inline-icon' /> <TourHelpLink text='syntax tree' topic={HelpTopic.UI_FORMULA_TREE} />{' '}
          button opens a dialog with the parse tree of the formal definition — useful for understanding structure and
          spotting parse issues.
        </p>
        <p>
          The <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='type graph' topic={HelpTopic.UI_TYPE_GRAPH} /> button shows how types in the expression
          relate as an echelon graph — a visual map of typification steps.
        </p>
      </div>
    )
  },
  structure: {
    title: 'Structure planner',
    body: (
      <p>
        For structured concepts, <IconGenerateStructure size='1.25rem' className='inline-icon' /> Expand structure opens
        the <TourHelpLink text='structure planner' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: an interactive graph for
        decomposing a concept into derived constituents. You can add, edit, and link items directly from the diagram.
      </p>
    )
  }
};
