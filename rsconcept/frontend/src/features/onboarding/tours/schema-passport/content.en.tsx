import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Schema passport',
    body: (
      <p>
        The <TourHelpLink text='schema passport' topic={HelpTopic.UI_SCHEMA_CARD} /> holds the identity of a conceptual
        schema in the library: name, access, versions, and summary statistics.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Title appears in lists, alias is the short library identifier, and description documents the subject domain.
        Save with <IconSave className='inline-icon' /> or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Versions',
    body: (
      <p>
        Schemas can keep named <TourHelpLink text='versions' topic={HelpTopic.VERSIONS} />. Switch the active version
        from the selector, or create and edit versions from the toolbar above it.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block sets the sharing policy, visibility in the
        library, and whether the item is read-only for editors.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: (
      <p>
        Below the form you manage library metadata: folder location (<IconFolderEdit className='inline-icon' />
        ), owner (<IconOwner className='inline-icon' />
        ), editors, and creation/update dates.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <>
        <p>
          The side panel summarizes the schema: total constituents, axiomatic core and theory body, and correctness
          indicators (errors and incalculable definitions).
        </p>
        <p>
          Expand a category for a breakdown — for example base or constant sets, axioms, terms, textual definitions and
          conventions.
        </p>
      </>
    )
  }
};
