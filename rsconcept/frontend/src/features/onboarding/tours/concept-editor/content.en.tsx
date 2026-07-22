import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Concept editor',
    body: (
      <p>
        Here you edit one constituent in the <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />:
        its term, convention or textual definition, and formal definition. Select a row in the list on the left to open
        another constituent.
      </p>
    )
  },
  fields: {
    title: 'Constituent fields',
    body: (
      <p>
        Edit the term and the formal definition. For undefined concepts, meaning is set by a{' '}
        <TourHelpLink text='convention' topic={HelpTopic.CC_CONSTITUENTA} />; for derived ones — by a textual
        definition. Save with <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  check: {
    title: 'Check and diagnostics',
    body: (
      <>
        <p>
          After editing a formal definition, the <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='expression status' topic={HelpTopic.UI_CST_STATUS} /> indicator turns blue until you run a
          check. Click it or press <kbd>Ctrl + Q</kbd>.
        </p>
        <p>
          On errors, a list appears below the editor — click a message to jump to the fragment. A{' '}
          <IconStatusOK className='inline-icon' /> green "valid" status means the definition is verified and computable.
        </p>
      </>
    )
  },
  tools: {
    title: 'Syntax tree, type graph, and structure',
    body: (
      <>
        <p>
          <IconTree className='inline-icon' /> <TourHelpLink text='Syntax tree' topic={HelpTopic.UI_FORMULA_TREE} /> —{' '}
          the parse tree of the formal definition: expression structure and parse errors.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' /> <TourHelpLink text='Type graph' topic={HelpTopic.UI_TYPE_GRAPH} /> —
          how types in the expression relate as typification echelons.
        </p>
        <p>
          When the constituent has a typification structure,{' '}
          <IconGenerateStructure size='1.25rem' className='inline-icon' /> Expand structure opens{' '}
          <TourHelpLink text='structure expansion' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: from the echelon graph you
          can add generated constituents and set their terms.
        </p>
      </>
    )
  }
};
