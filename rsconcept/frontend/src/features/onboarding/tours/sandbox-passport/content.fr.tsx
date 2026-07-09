import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport du bac à sable',
    body: (
      <p>
        Dans le bac à sable, le passeport nomme le schéma et le modèle de démonstration locaux. Les données restent dans
        le navigateur — sans accès ni propriété de bibliothèque. Les passeports complets sont décrits sous{' '}
        <TourHelpLink text='passeport du schéma' topic={HelpTopic.UI_SCHEMA_CARD} /> et{' '}
        <TourHelpLink text='passeport du modèle' topic={HelpTopic.UI_MODEL_CARD} />.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Modifiez le titre, l&apos;alias et la description de la démo. Les changements sont locaux ;{' '}
        <IconSave className='inline-icon' /> les applique au lot du bac à sable.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le panneau latéral reprend le style du passeport modèle : compteurs de constituantes du schéma et problèmes du
          modèle (données de base manquantes, calculs échoués, etc.).
        </p>
        <p>
          Développez les catégories pour le détail. En bibliothèque, les passeports schéma et modèle ajoutent accès,
          emplacement, et plus.
        </p>
      </div>
    )
  }
};
