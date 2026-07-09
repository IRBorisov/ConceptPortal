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
        schema in the library and summarizes its operations. Composition is edited on the graph tab.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Title, alias, and description work like other library passports. Save with <IconSave className='inline-icon' />{' '}
        or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Access',
    body: (
      <p>
        The <TourHelpLink text='access' topic={HelpTopic.ACCESS} /> block sets sharing policy, visibility, and read-only
        mode — same controls as on schema and model passports.
      </p>
    )
  },
  library: {
    title: 'Location and ownership',
    body: <p>Location, owner, editors, and dates appear below the form, consistent with other Portal library items.</p>
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The side panel counts operations by type (blocks, inputs, synthesis, replicas) and attached conceptual schemas
          (total, owned, imported).
        </p>
        <p>
          For the graph of operations, open the <TourHelpLink text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} /> tab.
        </p>
      </div>
    )
  }
};
