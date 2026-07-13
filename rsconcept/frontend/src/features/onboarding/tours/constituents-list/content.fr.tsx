import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconSearch
} from '@/components/icons';

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
  selection: {
    title: 'Compteur de sélection',
    body: (
      <p>
        Le compteur à gauche indique combien de constituantes sont sélectionnées sur le total. Cliquez sur une ligne
        pour sélectionner ; <kbd>Esc</kbd> efface la sélection.
      </p>
    )
  },
  toolbar: {
    title: "Barre d'outils",
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconNewItem className='inline-icon icon-green' /> créer, <IconClone className='inline-icon icon-green' />{' '}
          cloner et <IconDestroy className='inline-icon icon-red' /> supprimer la sélection.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> réordonnent ;{' '}
          <IconCrucial className='inline-icon' /> marque les constituantes cruciales.
        </p>
        <p>
          Sur un modèle, <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule toutes
          les valeurs.
        </p>
      </div>
    )
  },
  interact: {
    title: 'Interactions du tableau',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <kbd>Shift</kbd>+clic étend la sélection. Un double-clic ou un clic avec <kbd>Alt</kbd> ouvre la constituante
          dans l&apos;
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
