import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Synthèse',
    body: (
      <p>
        Cette boîte de dialogue ajoute une opération <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='synthèse' topic={HelpTopic.CC_SYNTHESIS} /> à l&apos;OSS. Parcourez d&apos;abord{' '}
        <b>Arguments</b>, puis <b>Identifications</b>, puis cliquez sur <b>Créer</b>.
      </p>
    )
  },
  arguments: {
    title: 'Opération et arguments',
    body: (
      <>
        <p>
          Renseignez le titre, l&apos;<b>abréviation</b>, éventuellement le bloc parent et la description. Puis, dans{' '}
          <b>Choix des arguments</b>, sélectionnez les opérations dont les schémas seront fusionnés — en général des
          chargements ou des synthèses antérieures.
        </p>
        <p>
          Évitez de choisir à la fois une réplique et son original ; les paires incompatibles sont filtrées de la liste.
        </p>
      </>
    )
  },
  substitutions: {
    title: 'Table d’identification',
    body: (
      <>
        <p>
          Dans <b>Identifications</b>, construisez la{' '}
          <TourHelpLink text="table d'identification" topic={HelpTopic.UI_SUBSTITUTIONS} /> des constituantes des
          schémas arguments qui doivent représenter une seule constituante. Sous la table — le résultat de la
          vérification ; dans les lignes — des <b>suggestions</b> (accepter ou ignorer).
        </p>
        <p>
          Pour une <IconConsolidation className='inline-icon' /> synthèse en <b>losange</b> (ancêtres communs), ajoutez
          les doublons de constituantes avec soin. Après création, <b>activez</b> la synthèse dans le graphe avec{' '}
          <IconExecute className='inline-icon icon-green' /> pour les{' '}
          <TourHelpLink text='changements propagés' topic={HelpTopic.CC_PROPAGATION} />.
        </p>
      </>
    )
  }
};
