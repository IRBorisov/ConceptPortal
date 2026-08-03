import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passport',
    body: (
      <p>
        L’onglet «Passport» ouvre le <TourHelpLink text='passeport du modèle' topic={HelpTopic.UI_MODEL_CARD} /> — la
        fiche d’un modèle conceptuel lié à un schéma : nom, accès, lien vers le schéma et statistiques résumées.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Ici vous modifiez le titre, l&apos;alias et la description du modèle. Les attributs du schéma lié ne changent
        pas sur ce formulaire. Enregistrement — «Enregistrer les modifications» (
        <IconSave className='inline-icon' />) ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        À droite de l&apos;alias, la ligne <TourHelpLink text='«Accès»' topic={HelpTopic.ACCESS} /> définit la
        politique d&apos;accès (Privé / Protégé / Public), la visibilité dans la bibliothèque et l&apos;autorisation ou
        l&apos;interdiction de modification pour les éditeurs.
      </p>
    )
  },
  schema: {
    title: 'Schéma lié',
    body: (
      <p>
        Le lien avec l&apos;icône <IconRSForm className='inline-icon' /> et l&apos;alias du schéma ouvre le schéma
        conceptuel source, dont les constituantes sous-tendent les données et calculs du modèle.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Sous le formulaire — métadonnées de bibliothèque : emplacement (<IconFolderEdit className='inline-icon' />
        ), propriétaire (
        <IconOwner className='inline-icon' />
        ), éditeurs et dates de création/mise à jour.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <>
        <p>
          Le panneau latéral comprend «Contenu» et «Schéma» (structure du schéma lié), «Correction» (problèmes du
          schéma) et «Modèle» (problèmes du modèle : notions non définies sans interprétation, axiomes violés, données
          invalides, erreurs de calcul et valeurs de termes vides).
        </p>
        <p>Développez les catégories pour voir le détail par type.</p>
      </>
    )
  }
};
