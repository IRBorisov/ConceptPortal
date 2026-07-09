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
        un schéma : nom, accès et statistiques d&apos;évaluation.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Modifiez ici le titre, l&apos;alias et la description du modèle. Les attributs du schéma ne se changent pas sur
        cet onglet — ouvrez le schéma lié. Enregistrez avec <IconSave className='inline-icon' /> ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> contrôle le partage, la visibilité dans la
        bibliothèque et le mode lecture seule pour ce modèle.
      </p>
    )
  },
  schema: {
    title: 'Schéma lié',
    body: (
      <p>
        Le lien <IconRSForm className='inline-icon' /> ouvre le schéma conceptuel source. Les données et
        l&apos;évaluation du modèle s&apos;appuient toujours sur ses constituantes.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Emplacement, propriétaire, éditeurs et dates se gèrent sous le formulaire — comme pour les autres éléments de
        bibliothèque.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le panneau latéral combine les compteurs de structure du schéma avec les problèmes du modèle : données de base
          manquantes, axiomes faux, valeurs invalides et calculs échoués.
        </p>
        <p>Utilisez-le comme contrôle rapide avant les onglets données et évaluation.</p>
      </div>
    )
  }
};
