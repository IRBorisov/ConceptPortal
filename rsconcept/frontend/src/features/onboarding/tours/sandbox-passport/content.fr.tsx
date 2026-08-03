import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

export const sandboxPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport',
    body: (
      <p>
        L&apos;onglet « Passeport » définit le titre, l&apos;alias et la description du schéma et modèle de démonstration
        locaux. Les données restent dans le navigateur — sans politiques d&apos;accès ni propriétaire de bibliothèque.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Modifiez le titre, l&apos;alias et la description. Les modifications n&apos;entrent dans les données du Bac à
        sable du navigateur qu&apos;après enregistrement — <IconSave className='inline-icon' /> « Enregistrer » ou{' '}
        <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <>
        <p>
          Le panneau latéral est découpé en Contenu, Schéma, Correction et Modèle. Sous Modèle — problèmes
          d&apos;interprétation : concepts non définis sans interprétation, axiomes violés, données invalides et erreurs
          de calcul.
        </p>
        <p>Développez les catégories pour le détail par type.</p>
      </>
    )
  }
};
