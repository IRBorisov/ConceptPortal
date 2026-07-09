import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Sandbox passport',
    body: (
      <p>
        In the Sandbox the passport names the local demo schema and model. Data stays in the browser — there is no
        library access or ownership here. Full library passports are documented under{' '}
        <TourHelpLink text='schema passport' topic={HelpTopic.UI_SCHEMA_CARD} /> and{' '}
        <TourHelpLink text='model passport' topic={HelpTopic.UI_MODEL_CARD} />.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the demo title, alias, and description. Changes are stored locally; use{' '}
        <IconSave className='inline-icon' /> to apply them to the Sandbox bundle.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The side panel shows the same style of summary as a model passport: constituent counts from the schema plus
          model issues such as missing base data or failed calculations.
        </p>
        <p>
          Expand categories for a breakdown. In the library, schema and model passports add access, location, and more.
        </p>
      </div>
    )
  }
};
