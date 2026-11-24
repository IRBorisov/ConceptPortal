import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconReset, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'OSS passport',
    body: (
      <>
        <p>
          The <TourHelpLink text='OSS passport' topic={HelpTopic.UI_OSS_CARD} /> describes an operational schema (OSS)
          in the library: name, access, and summary operation statistics.
        </p>
        <p>The operations graph is on the Graph tab (separate tour).</p>
      </>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Title appears in lists, alias is the short library identifier, and description documents the subject domain.
        Save with <IconSave className='inline-icon' /> or <kbd>Ctrl + S</kbd>; reset with{' '}
        <IconReset className='inline-icon' />.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        <TourHelpLink text='Access' topic={HelpTopic.ACCESS} /> sets the access policy, visibility in the library, and
        whether the item is read-only for editors.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: (
      <p>
        Below the form — library location (<IconFolderEdit className='inline-icon' />
        ), open in library (<IconFolderOpened className='inline-icon' />
        ), owner (<IconOwner className='inline-icon' />
        ), editors, and creation/update dates.
      </p>
    )
  },
  stats: {
    title: 'Contents and attached schemas',
    body: (
      <>
        <p>
          The side panel: Contents counts operations by type (Blocks, Input, Synthesis, Replica), and Attached schemas
          shows total, original, and Import schema.
        </p>
        <p>Expand categories to see the breakdown.</p>
      </>
    )
  }
};
