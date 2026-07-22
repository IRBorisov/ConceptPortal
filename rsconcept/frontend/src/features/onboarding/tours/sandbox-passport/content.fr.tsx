import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

export const sandboxPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport du Bac à sable',
    body: (
      <p>
        Le passeport définit le titre, l&apos;alias et la description du schéma et modèle de démo locaux. Les données
        restent dans le navigateur — sans accès ni propriété de bibliothèque.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Modifiez le titre, l&apos;alias et la description de démo. Les changements sont locaux ;{' '}
        <IconSave className='inline-icon' /> les applique au jeu du Bac à sable.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <>
        <p>
          Le panneau latéral montre les compteurs de constituantes du schéma et les problèmes du modèle — par exemple
          concepts non définis sans interprétation ou erreurs de calcul.
        </p>
        <p>Développez les catégories pour le détail par type.</p>
      </>
    )
  }
};
