import { HelpTopic } from '@/features/help';
import { IconRelocationUp } from '@/features/oss/components/icon-relocation-up';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const relocateCstContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Relocate constituents',
    body: (
      <>
        <p>
          <TourHelpLink text='Relocate' topic={HelpTopic.UI_RELOCATE_CST} /> moves original constituents between schemas
          linked by an OSS operation.
        </p>
        <p>
          Pick <b>Source schema</b>, toggle <b>Relocation direction</b>{' '}
          <IconRelocationUp value={true} className='inline-icon' /> /{' '}
          <IconRelocationUp value={false} className='inline-icon' /> (up into an argument or down into a result), then
          choose <b>Target schema</b>.
        </p>
      </>
    )
  },
  selection: {
    title: 'What can move',
    body: (
      <p>
        The list fills after you pick <b>Target schema</b> — it shows candidates for the <b>Source schema</b> →{' '}
        <b>Target schema</b> pair; ineligible items are hidden. Only <b>original</b> constituents move; inherited ones
        (dashed border) may appear in the list but are not relocated. Select what to move and click <b>Move</b>.
      </p>
    )
  }
};
