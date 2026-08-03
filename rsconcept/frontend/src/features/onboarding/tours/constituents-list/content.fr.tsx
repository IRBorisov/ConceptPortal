import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset,
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
        axiomes, énoncés, etc. L&apos;onglet Liste les regroupe en tableau ; si un modèle est ouvert — aussi la colonne
        « Valeur ». Manuels : <TourHelpLink text='liste du schéma' topic={HelpTopic.UI_SCHEMA_LIST} />,{' '}
        <TourHelpLink text='liste du modèle' topic={HelpTopic.UI_MODEL_LIST} />.
      </p>
    )
  },
  filter: {
    title: 'Recherche',
    body: (
      <>
        <p>
          Essayez : saisissez du texte dans le champ <IconSearch className='inline-icon' />. La liste se filtre par nom,
          terme, définition formelle et textuelle, convention ou commentaire. Appuyez sur Entrée ou cliquez hors du champ
          — le guide continue.
        </p>
        <p>
          Plus de détails dans les manuels de la{' '}
          <TourHelpLink text='liste du schéma' topic={HelpTopic.UI_SCHEMA_LIST} /> et de la{' '}
          <TourHelpLink text='liste du modèle' topic={HelpTopic.UI_MODEL_LIST} />.
        </p>
      </>
    )
  },
  selection: {
    title: 'Sélection … sur …',
    body: (
      <p>
        À gauche s&apos;affiche combien de constituantes sont sélectionnées sur le total. Cliquez une ligne pour
        sélectionner ; <kbd>Esc</kbd> ou <IconReset className='inline-icon' /> dans la barre efface la sélection. Le
        compteur et la barre n&apos;apparaissent qu&apos;en mode édition.
      </p>
    )
  },
  toolbar: {
    title: 'Barre d’outils de la liste',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> efface la sélection (<kbd>Esc</kbd>). Dans un modèle,{' '}
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule ensuite toutes les
          valeurs. <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> changent
          l&apos;ordre ; <IconCrucial className='inline-icon' /> marque les constituantes cruciales.
        </p>
        <p>
          <IconOpenList className='inline-icon icon-green' /> crée par type,{' '}
          <IconNewItem className='inline-icon icon-green' /> via dialogue ;{' '}
          <IconClone className='inline-icon icon-green' /> clone et <IconDestroy className='inline-icon icon-red' />{' '}
          supprime la sélection. La barre n&apos;est visible qu&apos;en édition.
        </p>
      </>
    )
  },
  interact: {
    title: 'Travail avec le tableau',
    body: (
      <>
        <p>
          <kbd>Shift</kbd>+clic étend la sélection. Double-clic ou clic avec <kbd>Alt</kbd> ouvre la constituante : dans
          un schéma — l&apos;onglet <TourHelpLink text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> ; dans un modèle
          — l&apos;onglet <TourHelpLink text='Données' topic={HelpTopic.UI_MODEL_VALUE} />.
        </p>
        <p>
          Faites glisser les lignes pour changer l&apos;ordre. Tant que la recherche est active, le réordonnancement (et
          les flèches de la barre) est désactivé — videz d&apos;abord le champ.
        </p>
      </>
    )
  }
};
