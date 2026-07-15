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

export const modelValueContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Données du modèle',
    body: (
      <p>
        Dans l&apos;onglet <TourHelpLink text='données du modèle' topic={HelpTopic.UI_MODEL_VALUE} /> vous saisissez et
        consultez les valeurs des constituantes. Les concepts non définis reçoivent une interprétation (pour les
        ensembles de base — des éléments du domaine) ; les dérivés se calculent d&apos;après les définitions.
      </p>
    )
  },
  tools: {
    title: 'Calcul et enregistrement',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) calcule la constituante courante
          ; <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le modèle.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) enregistre la valeur ;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> — import ou export.
        </p>
      </div>
    )
  },
  form: {
    title: 'Éditeur de valeur',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le bouton <IconStatusUnknown className='inline-icon' /> de statut lance le calcul. Pour les ensembles de base,
          le <TourHelpLink text='dialogue de liaison' topic={HelpTopic.UI_MODEL_BINDING} /> définit les éléments du
          domaine.
        </p>
        <p>
          Voir le manuel <TourHelpLink text='édition des valeurs' topic={HelpTopic.UI_MODEL_VALUE_EDIT} /> pour les
          formats de valeurs.
        </p>
      </div>
    )
  }
};
