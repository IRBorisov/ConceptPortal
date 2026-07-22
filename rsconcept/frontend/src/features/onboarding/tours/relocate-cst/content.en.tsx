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
          <TourHelpLink text='Relocate' topic={HelpTopic.UI_RELOCATE_CST} /> moves non-inherited constituents between
          schemas linked by an OSS operation — typically to push concepts up into an argument schema or down into a
          result.
        </p>
        <p>
          Pick the source schema, toggle direction with <IconRelocationUp value={true} className='inline-icon' />, then
          choose the destination among the allowed neighbors.
        </p>
      </>
    )
  },
  selection: {
    title: 'What can move',
    body: (
      <p>
        Only constituents that are not inherited and are valid for the chosen edge appear in the list. Select the ones
        to move, then confirm. Inherited and blocked items stay put so propagation stays consistent.
      </p>
    )
  }
};
