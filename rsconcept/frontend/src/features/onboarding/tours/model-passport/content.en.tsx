import { HelpTopic } from '@/features/help';

import { IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Model passport',
    body: (
      <p>
        The <TourHelpLink text='model passport' topic={HelpTopic.UI_MODEL_CARD} /> describes a conceptual model bound to
        a schema: name, access, and summary statistics for the schema and model.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the model title, alias, and description here. Attributes of the linked schema are not changed on this form.
        Save with <IconSave className='inline-icon' /> or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block sets the sharing policy, visibility in the
        library, and read-only mode for this model.
      </p>
    )
  },
  schema: {
    title: 'Linked schema',
    body: (
      <p>
        The <IconRSForm className='inline-icon' /> link opens the source conceptual schema whose constituents underlie
        the model data and evaluations.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: <p>Below the form — library location, owner, editors, and creation/update dates.</p>
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The side panel combines schema structure counts with model issues: undefined concepts without interpretation,
          violated axioms, invalid data, and evaluation errors.
        </p>
        <p>Expand categories to see the breakdown by type.</p>
      </div>
    )
  }
};
