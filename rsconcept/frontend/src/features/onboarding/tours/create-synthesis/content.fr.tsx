import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Créer une synthèse',
    body: (
      <p>
        Cette boîte de dialogue ajoute une opération <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='synthèse' topic={HelpTopic.CC_SYNTHESIS} /> à l&apos;OSS. Parcourez d&apos;abord{' '}
        <b>Arguments</b>, puis <b>Identifications</b> avant de créer.
      </p>
    )
  },
  arguments: {
    title: 'Opération et arguments',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Renseignez le titre, l&apos;alias, éventuellement le bloc parent et la description. Sélectionnez ensuite les
          opérations arguments dont les schémas seront fusionnés — en général des chargements ou des synthèses
          antérieures.
        </p>
        <p>
          Évitez de choisir à la fois une réplique et son original ; les paires incompatibles sont filtrées de la liste.
        </p>
      </div>
    )
  },
  substitutions: {
    title: 'Table d’identification',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Dans <b>Identifications</b>, construisez la{' '}
          <TourHelpLink text="table d'identification" topic={HelpTopic.UI_SUBSTITUTIONS} /> : associez les constituantes
          des schémas arguments qui doivent représenter le même concept. Les messages sous la table signalent les
          conflits et suggèrent des correspondances.
        </p>
        <p>
          Pour une <IconConsolidation className='inline-icon' /> synthèse en diamant (ancêtres communs), ajoutez les
          doublons avec soin. Créer exécute l&apos;opération une fois pour permettre les{' '}
          <TourHelpLink text='changements propagés' topic={HelpTopic.CC_PROPAGATION} /> — comme activer la synthèse avec{' '}
          <IconExecute className='inline-icon icon-green' />.
        </p>
      </div>
    )
  }
};
