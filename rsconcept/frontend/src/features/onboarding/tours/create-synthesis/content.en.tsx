import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Create synthesis',
    body: (
      <p>
        This dialog adds a <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='synthesis' topic={HelpTopic.CC_SYNTHESIS} /> operation to the OSS. Work through{' '}
        <b>Arguments</b> first, then the <b>Substitutions</b> (identification) table before creating.
      </p>
    )
  },
  arguments: {
    title: 'Operation and arguments',
    body: (
      <>
        <p>
          Fill in title, alias, optional parent block, and description. Then select the argument operations whose
          schemas will be merged — typically loads or prior syntheses that feed this step.
        </p>
        <p>Avoid picking both a replica and its original; incompatible pairs are filtered out of the list.</p>
      </>
    )
  },
  substitutions: {
    title: 'Identification table',
    body: (
      <>
        <p>
          On <b>Substitutions</b>, build the{' '}
          <TourHelpLink text='identification table' topic={HelpTopic.UI_SUBSTITUTIONS} />: pair constituents from
          argument schemas that should be treated as the same concept. Validation messages below the table flag
          conflicts and suggest matches.
        </p>
        <p>
          For <IconConsolidation className='inline-icon' /> diamond synthesis (shared ancestors), add duplicate concepts
          carefully. Create runs the operation once so{' '}
          <TourHelpLink text='propagated changes' topic={HelpTopic.CC_PROPAGATION} /> can follow — like activating
          synthesis with <IconExecute className='inline-icon icon-green' />.
        </p>
      </>
    )
  }
};
