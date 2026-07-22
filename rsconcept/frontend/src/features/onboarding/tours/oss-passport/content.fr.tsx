import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport de l’OSS',
    body: (
      <p>
        Le <TourHelpLink text='passeport de l’OSS' topic={HelpTopic.UI_OSS_CARD} /> identifie un schéma opérationnel de
        synthèse dans la bibliothèque : nom, accès et statistiques résumées des opérations.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Titre, alias et description identifient l&apos;OSS dans la bibliothèque. Enregistrement —{' '}
        <IconSave className='inline-icon' /> ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> définit la politique de partage, la visibilité
        dans la bibliothèque et le mode lecture seule.
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
          Le panneau latéral compte les opérations par type (blocs, chargement, synthèse, réplication) et les schémas
          conceptuels liés (total, propres, import).
        </p>
        <p>Développez les catégories pour voir le détail.</p>
      </>
    )
  }
};
