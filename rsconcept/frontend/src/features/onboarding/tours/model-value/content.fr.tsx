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
        Sur l&apos;onglet <TourHelpLink text='données du modèle' topic={HelpTopic.UI_MODEL_VALUE} />, attribuez des
        valeurs concrètes aux ensembles de base et autres constituantes interprétables. Le schéma définit la structure ;
        le modèle la remplit depuis un domaine sujet.
      </p>
    )
  },
  tools: {
    title: 'Calculer et enregistrer',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) calcule la constituante
          courante ; <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le
          modèle.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) enregistre la valeur ;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> l&apos;importent ou
          l&apos;exportent.
        </p>
      </div>
    )
  },
  form: {
    title: 'Éditeur de valeur',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Cliquez sur le bouton de <IconStatusUnknown className='inline-icon' /> statut pour calculer, ou ouvrez le
          dialogue de valeur pour une édition structurée. Pour les ensembles de base, le{' '}
          <TourHelpLink text='dialogue de liaison' topic={HelpTopic.UI_MODEL_BINDING} /> assigne les éléments du
          domaine.
        </p>
        <p>
          Voir aussi <TourHelpLink text="l'édition de valeurs" topic={HelpTopic.UI_MODEL_VALUE_EDIT} />.
        </p>
      </div>
    )
  }
};
