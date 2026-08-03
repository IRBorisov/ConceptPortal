import { HelpTopic } from '@/features/help';

import {
  IconFilterReset,
  IconFolderEdit,
  IconSearch,
  IconSortAsc,
  IconSubfolders,
  IconText
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentFr: Record<string, TourStepContent> = {
  welcome: {
    title: 'Bibliothèque',
    body: (
      <>
        <p>
          La <TourHelpLink text='bibliothèque' topic={HelpTopic.UI_LIBRARY} /> permet de parcourir et d&apos;ouvrir les
          schémas conceptuels, modèles et schémas de synthèse opérationnelle (OSS) stockés dans le Portail.
        </p>
        <p>Ce court tour présente les dossiers, la recherche et le tableau des éléments.</p>
      </>
    )
  },
  folders: {
    title: 'Dossiers',
    body: (
      <p>
        Le panneau gauche est l&apos;explorateur. Cliquez sur un dossier pour afficher ses éléments à droite.
        Ctrl/Cmd+clic copie le chemin. Les icônes indiquent si un dossier contient des éléments ou des sous-dossiers.
      </p>
    )
  },
  location: {
    title: 'Emplacement actuel',
    body: (
      <p>
        La barre de chemin montre le dossier actuel. Utilisez <IconFolderEdit className='inline-icon' /> pour modifier
        l&apos;emplacement et déplacer vos schémas (si autorisé) et <IconSubfolders className='inline-icon' /> pour
        inclure ou masquer les éléments des sous-dossiers.
      </p>
    )
  },
  search: {
    title: 'Recherche et filtres',
    body: (
      <p>
        Le sélecteur « Filtre » restreint la liste (type, rôle, masqués…). Basculez Métadonnées (
        <IconSearch className='inline-icon' />) et Recherche contextuelle (<IconText className='inline-icon' />) avec le
        commutateur de mode ; utilisez éventuellement « Recherche par propriétaire ».{' '}
        <IconFilterReset className='inline-icon' /> réinitialise le filtre.
      </p>
    )
  },
  table: {
    title: 'Tableau des éléments',
    body: (
      <>
        <p>
          Cliquez sur une ligne pour ouvrir un élément. Ctrl/Cmd+clic l&apos;ouvre dans un nouvel onglet. Triez avec les
          en-têtes <IconSortAsc className='inline-icon' />.
        </p>
        <p>
          La couleur de ligne indique le type : vert pour les OSS, orange pour les modèles conceptuels, le reste pour
          les schémas.
        </p>
      </>
    )
  }
};
