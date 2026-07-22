import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconDatabase, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Evaluation',
    body: (
      <p>
        The <TourHelpLink text='Evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab checks and evaluates arbitrary
        RSLang expressions against the current model data without changing constituents or their interpretations.
      </p>
    )
  },
  tools: {
    title: 'Cache and recalculate',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> toggles the evaluation cache;{' '}
        <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalculates the whole model so
        expressions see up-to-date values.
      </p>
    )
  },
  form: {
    title: 'Expression and result',
    body: (
      <>
        <p>
          Enter an expression and click the <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='status' topic={HelpTopic.UI_EVAL_STATUS} /> button to evaluate. Typification, errors, and
          the value appear below.
        </p>
        <p>
          Open the result in the <IconDatabase className='inline-icon' /> value viewer for a structured breakdown.
        </p>
      </>
    )
  }
};
