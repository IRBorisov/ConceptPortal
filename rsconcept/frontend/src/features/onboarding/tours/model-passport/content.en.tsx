import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Passport',
    body: (
      <p>
        The «Passport» tab opens the <TourHelpLink text='model passport' topic={HelpTopic.UI_MODEL_CARD} /> — the card
        for a conceptual model bound to a schema: name, access, a link to the schema, and summary statistics.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the model title, alias, and description here. Attributes of the linked schema are not changed on this form.
        Save with «Save changes» (<IconSave className='inline-icon' />) or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        To the right of the alias, the <TourHelpLink text='Access' topic={HelpTopic.ACCESS} /> row sets the access
        policy (Private / Protected / Public), library visibility, and whether editors may change the model.
      </p>
    )
  },
  schema: {
    title: 'Linked schema',
    body: (
      <p>
        The link with the <IconRSForm className='inline-icon' /> icon and the schema alias opens the source conceptual
        schema whose constituents underlie the model data and evaluations.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: (
      <p>
        Below the form — library metadata: location (<IconFolderEdit className='inline-icon' />
        ), owner (
        <IconOwner className='inline-icon' />
        ), editors, and creation/update dates.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <>
        <p>
          The side panel has «Contents» and «Schema» (structure of the linked schema), «Correctness» (schema issues),
          and «Model» (model issues: undefined concepts without interpretation, violated axioms, invalid data,
          evaluation errors, and empty term values).
        </p>
        <p>Expand categories to see the breakdown by type.</p>
      </>
    )
  }
};
