import { HelpTopic } from '@/features/help';

import { IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Model passport',
    body: (
      <p>
        The <TourHelpLink text='model passport' topic={HelpTopic.UI_MODEL_CARD} /> describes a conceptual model attached
        to a schema: its name, access settings, and evaluation statistics.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the model&apos;s title, alias, and description here. Schema attributes are not changed on this tab — open
        the linked schema for that. Save with <IconSave className='inline-icon' /> or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block controls sharing policy, library visibility,
        and read-only mode for this model.
      </p>
    )
  },
  schema: {
    title: 'Linked schema',
    body: (
      <p>
        The <IconRSForm className='inline-icon' /> link opens the source conceptual schema. Model data and evaluation
        always refer to that schema&apos;s constituents.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: (
      <p>
        Folder location, owner, editors, and timestamps are managed below the form — same pattern as other library
        items.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The side panel combines schema structure counts with model-specific issues: missing base data, false axioms,
          invalid values, and failed calculations.
        </p>
        <p>Use it as a quick health check before opening the data or evaluation tabs.</p>
      </div>
    )
  }
};
