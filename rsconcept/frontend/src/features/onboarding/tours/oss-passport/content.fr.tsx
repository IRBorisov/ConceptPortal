import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconReset, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport de l’OSS',
    body: (
      <>
        <p>
          Le <TourHelpLink text='passeport de l’OSS' topic={HelpTopic.UI_OSS_CARD} /> décrit un schéma opérationnel
          (OSS) dans la bibliothèque : nom, accès et statistiques résumées des opérations.
        </p>
        <p>Le graphe des opérations se trouve dans l’onglet « Graphe » (visite guidée séparée).</p>
      </>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Le titre apparaît dans les listes, l&apos;alias est l&apos;identifiant court dans la bibliothèque, et la
        description documente le domaine. Enregistrement — <IconSave className='inline-icon' /> ou{' '}
        <kbd>Ctrl + S</kbd> ; réinitialisation — <IconReset className='inline-icon' />.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        <TourHelpLink text='Accès' topic={HelpTopic.ACCESS} /> définit la politique d&apos;accès, la visibilité dans la
        bibliothèque et le mode lecture seule pour les éditeurs.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Sous le formulaire — emplacement dans la bibliothèque (<IconFolderEdit className='inline-icon' />
        ), ouverture dans la bibliothèque (<IconFolderOpened className='inline-icon' />
        ), propriétaire (<IconOwner className='inline-icon' />
        ), éditeurs et dates de création/mise à jour.
      </p>
    )
  },
  stats: {
    title: 'Contenu et schémas attachés',
    body: (
      <>
        <p>
          Le panneau latéral : « Contenu » compte les opérations par type (Blocs, Chargement, Synthèse, Réplication), et
          « Schémas attachés » — total, propres et « Importer le schéma ».
        </p>
        <p>Développez les catégories pour voir le détail.</p>
      </>
    )
  }
};
