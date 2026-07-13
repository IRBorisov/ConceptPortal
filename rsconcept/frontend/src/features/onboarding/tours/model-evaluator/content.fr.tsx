import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconDatabase, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Évaluation',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> vérifie et calcule des
        expressions arbitraires dans le modèle courant sans modifier les constituantes ni leurs interprétations —
        utile pour déboguer des formules et inspecter des résultats intermédiaires.
      </p>
    )
  },
  tools: {
    title: 'Cache et recalcul',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> active ou désactive le cache d&apos;évaluation ;{' '}
        <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le modèle pour que
        les expressions ad hoc voient des valeurs à jour.
      </p>
    )
  },
  form: {
    title: 'Expression et résultat',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Saisissez une expression, puis cliquez sur le bouton de <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='statut' topic={HelpTopic.UI_EVAL_STATUS} /> pour calculer. La typification, les erreurs
          et la valeur apparaissent en dessous.
        </p>
        <p>
          Ouvrez le résultat dans le visualiseur de valeurs <IconDatabase className='inline-icon' /> pour une
          inspection structurée.
        </p>
      </div>
    )
  }
};
