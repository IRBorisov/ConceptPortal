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
        L&apos;onglet <TourHelpLink text='Évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> vérifie et calcule des
        expressions RSLang arbitraires sur les données du modèle, sans modifier les constituantes ni leurs
        interprétations.
      </p>
    )
  },
  tools: {
    title: 'Cache et recalcul',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> active ou désactive le cache de calcul ;{' '}
        <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le modèle pour que
        les expressions voient des valeurs à jour.
      </p>
    )
  },
  form: {
    title: 'Expression et résultat',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Saisissez une expression et cliquez sur <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='statut' topic={HelpTopic.UI_EVAL_STATUS} /> pour calculer. Typification, erreurs et valeur
          apparaissent en dessous.
        </p>
        <p>
          Ouvrez le résultat dans la <IconDatabase className='inline-icon' /> visionneuse de valeurs pour une analyse
          structurée.
        </p>
      </div>
    )
  }
};
