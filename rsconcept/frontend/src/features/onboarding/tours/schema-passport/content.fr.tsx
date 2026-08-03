import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passport',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Passport' topic={HelpTopic.UI_SCHEMA_CARD} /> regroupe les métadonnées du
        schéma conceptuel dans la bibliothèque : titre, accès, versions et statistiques résumées.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Le titre apparaît dans les listes, l&apos;alias est l&apos;identifiant court dans la bibliothèque, et la
        description contient sources, notes et commentaires. Enregistrez avec <IconSave className='inline-icon' /> ou{' '}
        <kbd>Ctrl + S</kbd> / <kbd>Cmd + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Version',
    body: (
      <p>
        Les schémas peuvent conserver des <TourHelpLink text='versions' topic={HelpTopic.VERSIONS} /> nommées. Changez
        la version active dans la liste ; au-dessus du champ Version — icônes pour créer une version, modifier la liste
        et restaurer.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> comporte trois éléments : la politique (Privé /
        Protégé / Public), la visibilité dans la liste de la bibliothèque, et l&apos;autorisation ou l&apos;interdiction
        de modification.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Sous le formulaire : métadonnées de bibliothèque — ouvrir dans la bibliothèque (
        <IconFolderOpened className='inline-icon' />
        ), emplacement (<IconFolderEdit className='inline-icon' />
        ), propriétaire (<IconOwner className='inline-icon' />
        ), éditeurs et dates. Pour les schémas produits, l&apos;emplacement et le propriétaire sont hérités de l&apos;OSS.
      </p>
    )
  },
  stats: {
    title: 'Résumé du schéma',
    body: (
      <>
        <p>
          Le panneau latéral résume le schéma par Contenu, Noyau de la théorie, Corps de la théorie et Correction
          (erreurs et définitions incalculables).
        </p>
        <p>
          Développez une catégorie pour le détail — par exemple ensemble de base, ensemble constant, structure et
          axiome ; ou termes, définitions textuelles et conventions.
        </p>
      </>
    )
  }
};
