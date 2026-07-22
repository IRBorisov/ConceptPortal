import { HelpTopic } from '@/features/help';

import { IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport du modèle',
    body: (
      <p>
        Le <TourHelpLink text='passeport du modèle' topic={HelpTopic.UI_MODEL_CARD} /> décrit un modèle conceptuel lié à
        un schéma : nom, accès et statistiques résumées du schéma et du modèle.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Ici vous modifiez le titre, l&apos;alias et la description du modèle. Les attributs du schéma lié ne changent
        pas sur ce formulaire. Enregistrement — <IconSave className='inline-icon' /> ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> définit la politique de partage, la visibilité
        dans la bibliothèque et le mode lecture seule pour ce modèle.
      </p>
    )
  },
  schema: {
    title: 'Schéma lié',
    body: (
      <p>
        Le lien <IconRSForm className='inline-icon' /> ouvre le schéma conceptuel source, dont les constituantes
        sous-tendent les données et calculs du modèle.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Sous le formulaire — emplacement dans la bibliothèque, propriétaire, éditeurs et dates de création/mise à jour.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <>
        <p>
          Le panneau latéral combine les compteurs de structure du schéma et les problèmes du modèle : concepts non
          définis sans interprétation, axiomes violés, données invalides et erreurs de calcul.
        </p>
        <p>Développez les catégories pour voir le détail par type.</p>
      </>
    )
  }
};
