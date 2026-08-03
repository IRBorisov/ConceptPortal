import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Synthesis',
    body: (
      <p>
        This dialog adds a <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='synthesis' topic={HelpTopic.CC_SYNTHESIS} /> operation to the OSS. Work through{' '}
        <b>Arguments</b> first, then the <b>Substitutions</b> table, then click <b>Create</b>.
      </p>
    )
  },
  arguments: {
    title: 'Operation and arguments',
    body: (
      <>
        <p>
          Fill in title, <b>alias</b>, optional parent block, and description. Then in <b>Argument pick</b> select the
          operations whose schemas will be merged — typically loads or prior syntheses.
        </p>
        <p>Avoid picking both a replica and its original; incompatible pairs are filtered out of the list.</p>
      </>
    )
  },
  substitutions: {
    title: 'Substitution table',
    body: (
      <>
        <p>
          On <b>Substitutions</b>, build the{' '}
          <TourHelpLink text='substitution table' topic={HelpTopic.UI_SUBSTITUTIONS} /> of argument-schema constituents
          that should be treated as one constituent. Validation below the table shows the check result; rows may offer{' '}
          <b>suggestions</b> (accept or ignore).
        </p>
        <p>
          For <IconConsolidation className='inline-icon' /> <b>Rhombus</b> synthesis (shared ancestors), add duplicate
          constituents carefully. After creation, <b>activate</b> the synthesis in the graph with{' '}
          <IconExecute className='inline-icon icon-green' /> for{' '}
          <TourHelpLink text='propagated changes' topic={HelpTopic.CC_PROPAGATION} />.
        </p>
      </>
    )
  }
};
