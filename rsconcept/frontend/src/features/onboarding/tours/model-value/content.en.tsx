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
        Here <TourHelpLink text='model data' topic={HelpTopic.UI_MODEL_VALUE} /> lets you set and inspect constituent
        values. Undefined concepts get an interpretation (for base sets — subject-domain elements); derived ones are
        computed from definitions.
      </p>
    )
  },
  tools: {
    title: 'Compute and save',
    body: (
      <>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) computes the current
          constituent; <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalculates the
          whole model.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) saves the value;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> — import or export.
        </p>
      </>
    )
  },
  form: {
    title: 'Value editor',
    body: (
      <>
        <p>
          The <IconStatusUnknown className='inline-icon' /> status button runs computation. For base sets, the{' '}
          <TourHelpLink text='binding dialog' topic={HelpTopic.UI_MODEL_BINDING} /> sets subject-domain elements.
        </p>
        <p>
          See the <TourHelpLink text='value editing' topic={HelpTopic.UI_MODEL_VALUE_EDIT} /> manual for value formats.
        </p>
      </>
    )
  }
};
