import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport du schéma',
    body: (
      <p>
        Le <TourHelpLink text='passeport du schéma' topic={HelpTopic.UI_SCHEMA_CARD} /> porte l&apos;identité d&apos;un
        schéma conceptuel dans la bibliothèque : nom, accès, versions et statistiques résumées.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Le titre apparaît dans les listes, l&apos;alias est l&apos;identifiant court dans la bibliothèque, et la
        description documente le domaine. Enregistrez avec <IconSave className='inline-icon' /> ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Versions',
    body: (
      <p>
        Les schémas peuvent conserver des <TourHelpLink text='versions' topic={HelpTopic.VERSIONS} /> nommées. Changez
        la version active dans le sélecteur, ou créez et modifiez des versions depuis la barre d&apos;outils au-dessus.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> définit la politique de partage, la visibilité
        dans la bibliothèque et le mode lecture seule pour les éditeurs.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Sous le formulaire : métadonnées de bibliothèque — emplacement (<IconFolderEdit className='inline-icon' />
        ), propriétaire (<IconOwner className='inline-icon' />
        ), éditeurs et dates de création/mise à jour.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le panneau latéral résume le schéma : nombre de constituantes, noyau axiomatique et corps de la théorie, ainsi
          que les indicateurs de correction (erreurs et définitions incalculables).
        </p>
        <p>
          Développez une catégorie pour le détail — ensembles de base ou constantes, axiomes, termes, définitions
          textuelles et conventions.
        </p>
      </div>
    )
  }
};
