import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'OSS passport',
    body: (
      <p>
        The <TourHelpLink text='OSS passport' topic={HelpTopic.UI_OSS_CARD} /> identifies an operational synthesis
        schema in the library: name, access, and summary operation statistics.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Title, alias, and description identify the OSS in the library. Save with <IconSave className='inline-icon' /> or{' '}
        <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block sets the sharing policy, visibility in the
        library, and read-only mode.
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
          The side panel counts operations by type (blocks, inputs, synthesis, replicas) and linked conceptual schemas
          (total, owned, imported).
        </p>
        <p>Expand categories to see the breakdown.</p>
      </div>
    )
  }
};
