import { HelpTopic } from '@/features/help';

import { IconSearch } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const constituentsListContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Liste des constituantes',
    body: (
      <p>
        Les constituantes sont les éléments de base d&apos;un schéma : ensembles de base, termes, définitions et
        axiomes. L&apos;onglet <TourHelpLink text='liste' topic={HelpTopic.UI_MODEL_LIST} /> les regroupe dans un seul
        tableau — avec le statut d&apos;évaluation lorsqu&apos;un modèle est attaché.
      </p>
    )
  },
  filter: {
    title: 'Recherche',
    body: (
      <p>
        Le champ <IconSearch className='inline-icon' /> de recherche trouve les constituantes par alias, terme ou texte
        de définition. Voir le manuel de la{' '}
        <TourHelpLink text='liste des constituantes' topic={HelpTopic.UI_SCHEMA_LIST} />.
      </p>
    )
  },
  interact: {
    title: 'Sélection et ordre',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Cliquez sur une ligne pour sélectionner une constituante ; le compteur à gauche indique combien sont
          sélectionnées. Un double-clic ou un clic avec <kbd>Alt</kbd> ouvre la constituante dans l&apos;
          <TourHelpLink text='éditeur' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Faites glisser les lignes pour modifier l&apos;ordre dans le schéma. Le réordonnancement est désactivé tant
          qu&apos;une recherche est active — effacez le champ de recherche d&apos;abord si vous devez déplacer des
          éléments.
        </p>
      </div>
    )
  }
};
