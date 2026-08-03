import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Évaluation',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> vérifie et calcule
        des expressions <TourHelpLink text='RSLang' topic={HelpTopic.RSLANG} /> arbitraires sur les données du
        modèle. Contrairement à l&apos;onglet <TourHelpLink text='Données' topic={HelpTopic.UI_MODEL_VALUE} />, on
        n&apos;y édite pas les valeurs des constituantes — les données du modèle restent inchangées.
      </p>
    )
  },
  tools: {
    title: 'Cache et recalcul',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> désactive le cache de calcul (lorsque le cache
        est actif, l&apos;icône est colorée) ;{' '}
        <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le modèle pour
        que les expressions voient des valeurs à jour.
      </p>
    )
  },
  form: {
    title: 'Expression et résultat',
    body: (
      <>
        <p>
          Saisissez une expression dans le champ Définition formelle et cliquez sur{' '}
          <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='Non évalué' topic={HelpTopic.UI_EVAL_STATUS} /> (ou <kbd>Ctrl + Q</kbd>). La
          typification se met à jour en haut ; les erreurs apparaissent dans le champ d&apos;expression ; la valeur
          calculée apparaît en dessous.
        </p>
        <p>
          Le bouton Consulter la valeur ouvre une analyse structurée ; pour certains types, il est indisponible.
        </p>
      </>
    )
  }
};
