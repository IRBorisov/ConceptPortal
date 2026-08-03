import { HelpTopic } from '@/features/help';

import { IconCalculateAll, IconCalculateOne, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const calculateHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const modelValueContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Data',
    body: (
      <p>
        The <TourHelpLink text='Data' topic={HelpTopic.UI_MODEL_VALUE} /> tab (in help — model data) lets you set and
        inspect constituent values. Select a constituent in the list on the left. Undefined concepts get an
        interpretation (for base sets — subject-domain elements); derived ones are computed from definitions. Unlike the
        Evaluation tab, here you edit constituent values, not arbitrary expressions.
      </p>
    )
  },
  tools: {
    title: 'Compute and save',
    body: (
      <>
        <p>
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalculates the whole model;{' '}
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>{calculateHotkey}</kbd>) computes the current
          constituent — disabled while there are unsaved changes.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>{saveHotkey}</kbd>) saves form changes (term, definitions, value).
        </p>
      </>
    )
  },
  form: {
    title: 'Value editor',
    body: (
      <>
        <p>
          The Import and Export buttons load or dump the current constituent value (clipboard or JSON).
        </p>
        <p>
          Click the status bar (&quot;Not evaluated&quot; / …) — &quot;Save and calculate&quot;. For base sets, the{' '}
          <TourHelpLink text='base interpretation dialog' topic={HelpTopic.UI_MODEL_BINDING} /> sets subject-domain
          elements; for structures — the value editing dialog. With focus in the formal definition field,{' '}
          <kbd>{calculateHotkey}</kbd> checks the expression, not the value.
        </p>
        <p>
          See the <TourHelpLink text='value editing' topic={HelpTopic.UI_MODEL_VALUE_EDIT} /> manual for value formats.
        </p>
      </>
    )
  }
};
