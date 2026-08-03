import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Passport',
    body: (
      <p>
        The <TourHelpLink text='Passport' topic={HelpTopic.UI_SCHEMA_CARD} /> tab holds conceptual-schema metadata in
        the library: title, access, versions, and summary statistics.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Title appears in lists, alias is the short library identifier, and description holds sources, notes, and
        comments. Save with <IconSave className='inline-icon' /> or <kbd>Ctrl + S</kbd> / <kbd>Cmd + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Version',
    body: (
      <p>
        Schemas can keep named <TourHelpLink text='versions' topic={HelpTopic.VERSIONS} />. Switch the active version
        from the list; above the Version field are icons to create a version, edit the list, and revert.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block has three controls: access policy (Private /
        Protected / Public), visibility in the library list, and whether editing is allowed or forbidden.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: (
      <p>
        Below the form you manage library metadata: open in library (<IconFolderOpened className='inline-icon' />
        ), folder location (<IconFolderEdit className='inline-icon' />
        ), owner (<IconOwner className='inline-icon' />
        ), editors, and dates. For produced schemas, location and owner are inherited from the OSS.
      </p>
    )
  },
  stats: {
    title: 'Schema summary',
    body: (
      <>
        <p>
          The side panel summarizes the schema in Contents, Axiomatic core, Theory body, and Correctness (errors and
          incalculable definitions).
        </p>
        <p>
          Expand a category for a breakdown — for example base set, constant set, structure, and axiom; or terms,
          textual definitions, and conventions.
        </p>
      </>
    )
  }
};
