import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Evaluation',
    body: (
      <p>
        The <TourHelpLink text='Evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab checks and evaluates
        arbitrary <TourHelpLink text='RSLang' topic={HelpTopic.RSLANG} /> expressions against the current model
        data. Unlike the <TourHelpLink text='Data' topic={HelpTopic.UI_MODEL_VALUE} /> tab, it does not edit
        constituent values — model data stays unchanged.
      </p>
    )
  },
  tools: {
    title: 'Cache and recalculate',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> disables the evaluation cache (when the cache
        is on, the icon is colored); <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>)
        recalculates the whole model so expressions see up-to-date values.
      </p>
    )
  },
  form: {
    title: 'Expression and result',
    body: (
      <>
        <p>
          Enter an expression in the Formal definition field and click{' '}
          <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='Not evaluated' topic={HelpTopic.UI_EVAL_STATUS} /> (or <kbd>Ctrl + Q</kbd>).
          Typification updates above; errors appear in the expression field; the computed value appears below.
        </p>
        <p>The View value button opens a structured breakdown; it is unavailable for some types.</p>
      </>
    )
  }
};
