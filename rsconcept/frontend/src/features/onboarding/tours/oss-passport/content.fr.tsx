import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Passeport OSS',
    body: (
      <p>
        Le <TourHelpLink text='passeport OSS' topic={HelpTopic.UI_OSS_CARD} /> identifie un schéma de synthèse
        opérationnelle dans la bibliothèque et résume ses opérations. La composition est éditée sur l&apos;onglet
        graphe.
      </p>
    )
  },
  form: {
    title: 'Titre, alias, description',
    body: (
      <p>
        Titre, alias et description fonctionnent comme pour les autres passeports. Enregistrez avec{' '}
        <IconSave className='inline-icon' /> ou <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Accès',
    body: (
      <p>
        Le bloc <TourHelpLink text='accès' topic={HelpTopic.ACCESS} /> définit partage, visibilité et lecture seule —
        les mêmes contrôles que sur les passeports schéma et modèle.
      </p>
    )
  },
  library: {
    title: 'Emplacement et propriété',
    body: (
      <p>
        Emplacement, propriétaire, éditeurs et dates apparaissent sous le formulaire, comme pour les autres éléments.
      </p>
    )
  },
  stats: {
    title: 'Panneau de statistiques',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le panneau latéral compte les opérations par type (blocs, entrées, synthèse, répliques) et les schémas
          conceptuels attachés (total, propres, importés).
        </p>
        <p>
          Pour le graphe des opérations, ouvrez l&apos;onglet{' '}
          <TourHelpLink text='graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </div>
    )
  }
};
