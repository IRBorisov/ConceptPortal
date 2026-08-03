import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const checkHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const conceptEditorContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Concept',
    body: (
      <p>
        The Concept tab is where you edit one constituent in the{' '}
        <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />. Select a row in the list on the left
        to open another constituent.
      </p>
    )
  },
  fields: {
    title: 'Constituent fields',
    body: (
      <p>
        Edit the term, typification, and formal expression (the field label depends on the type: formal definition,
        domain of definition, function definition…). For undefined concepts, meaning is set by a{' '}
        <TourHelpLink text='convention' topic={HelpTopic.CC_CONSTITUENTA} />; for derived ones — by a textual
        definition. Save with <kbd>{saveHotkey}</kbd>.
      </p>
    )
  },
  check: {
    title: 'Check and diagnostics',
    body: (
      <>
        <p>
          The <IconStatusUnknown className='inline-icon' /> "non-checked" pill (blue) — click it or press{' '}
          <kbd>{checkHotkey}</kbd> to <TourHelpLink text='analyze the expression' topic={HelpTopic.UI_CST_STATUS} />.
        </p>
        <p>
          On errors, a list appears below the editor — click a message to jump to the fragment. A{' '}
          <IconStatusOK className='inline-icon' /> green "valid" status means the definition is verified and
          computable; green "non-measurable" means it is verified but only as a membership check.
        </p>
      </>
    )
  },
  tools: {
    title: 'Syntax tree and typification structure',
    body: (
      <>
        <p>
          Icons to the right of the expression field: help, symbol keyboard, typification structure, and syntax tree.
        </p>
        <p>
          <IconTree className='inline-icon' /> <TourHelpLink text='Syntax tree' topic={HelpTopic.UI_FORMULA_TREE} /> —{' '}
          the parse tree of the formal expression: structure and parse errors.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='Echelon graph from expression' topic={HelpTopic.UI_TYPE_GRAPH} /> — how types in the
          expression relate as typification echelons (hidden for logical constituents).
        </p>
      </>
    )
  },
  structure: {
    title: 'Expand structure',
    body: (
      <p>
        When available, <IconGenerateStructure size='1.25rem' className='inline-icon' /> Expand structure opens{' '}
        <TourHelpLink text='structure expansion' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: from the typification
        structure you can add generated constituents and set their terms.
      </p>
    )
  }
};
