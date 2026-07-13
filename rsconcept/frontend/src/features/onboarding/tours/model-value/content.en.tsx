import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconCalculateOne,
  IconDownload,
  IconSave,
  IconStatusUnknown,
  IconUpload
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelValueContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Model data',
    body: (
      <p>
        On the <TourHelpLink text='model data' topic={HelpTopic.UI_MODEL_VALUE} /> tab, assign concrete values to base
        sets and other interpretables. The schema defines structure; the model fills it from a subject domain.
      </p>
    )
  },
  tools: {
    title: 'Compute and save',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) computes the current
          constituent; <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalculates the
          whole model.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) saves the value;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> import or export it.
        </p>
      </div>
    )
  },
  form: {
    title: 'Value editor',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click the <IconStatusUnknown className='inline-icon' /> status button to compute, or open the value dialog for
          structured editing. For base sets, the{' '}
          <TourHelpLink text='binding dialog' topic={HelpTopic.UI_MODEL_BINDING} /> assigns domain elements.
        </p>
        <p>
          See also <TourHelpLink text='value editing' topic={HelpTopic.UI_MODEL_VALUE_EDIT} />.
        </p>
      </div>
    )
  }
};
