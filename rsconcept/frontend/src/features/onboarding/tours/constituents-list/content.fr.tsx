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
        Les constituantes sont les parties d&apos;un schéma conceptuel : concepts non définis, termes, fonctions,
        axiomes, énoncés, etc. L&apos;onglet <TourHelpLink text='liste' topic={HelpTopic.UI_MODEL_LIST} /> les regroupe
        en tableau ; si un modèle est ouvert — aussi le statut d&apos;évaluation.
      </p>
    )
  },
  filter: {
    title: 'Recherche',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Essayez : saisissez du texte dans le champ <IconSearch className='inline-icon' />. La liste se filtre par nom,
          terme, définitions et convention. Appuyez sur Entrée ou quittez le champ — le guide continue.
        </p>
        <p>
          Plus de détails dans le manuel de la{' '}
          <TourHelpLink text='liste des constituantes' topic={HelpTopic.UI_SCHEMA_LIST} />.
        </p>
      </div>
    )
  },
  selection: {
    title: 'Compteur de sélection',
    body: (
      <p>
        Le compteur à gauche indique le nombre de constituantes sélectionnées sur le total. Cliquez une ligne pour
        sélectionner ; <kbd>Esc</kbd> efface la sélection.
      </p>
    )
  },
  toolbar: {
    title: 'Barre d’outils de la liste',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconNewItem className='inline-icon icon-green' /> créer, <IconClone className='inline-icon icon-green' />{' '}
          cloner et <IconDestroy className='inline-icon icon-red' /> supprimer la sélection.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> changent l&apos;ordre ;{' '}
          <IconCrucial className='inline-icon' /> marque les constituantes cruciales.
        </p>
        <p>
          Si un modèle est ouvert, <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>)
          recalcule toutes les valeurs.
        </p>
      </div>
    )
  },
  interact: {
    title: 'Travail avec le tableau',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <kbd>Shift</kbd>+clic étend la sélection. Double-clic ou clic avec <kbd>Alt</kbd> ouvre la constituante dans
          l&apos;
          <TourHelpLink text='éditeur' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Faites glisser les lignes pour changer l&apos;ordre. Le réordonnancement est désactivé tant que la recherche
          est active — videz d&apos;abord le champ.
        </p>
      </div>
    )
  }
};
