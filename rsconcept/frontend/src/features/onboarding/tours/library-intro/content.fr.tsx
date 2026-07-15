import { HelpTopic } from '@/features/help';

import {
  IconDownload,
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
      <div className='flex flex-col gap-2'>
        <p>
          La <TourHelpLink text='bibliothèque' topic={HelpTopic.UI_LIBRARY} /> permet de parcourir et d&apos;ouvrir les
          schémas conceptuels, modèles et schémas de synthèse opérationnelle (OSS) stockés dans le Portail.
        </p>
        <p>Ce court tour présente les dossiers, la recherche et le tableau des éléments.</p>
      </div>
    )
  },
  folders: {
    title: 'Dossiers',
    body: (
      <p>
        Le panneau gauche est l&apos;explorateur d&apos;emplacements. Cliquez sur un dossier pour afficher ses éléments
        à droite. Ctrl/Cmd+clic copie le chemin. Les icônes indiquent si un emplacement contient des éléments ou des
        sous-dossiers.
      </p>
    )
  },
  location: {
    title: 'Emplacement actuel',
    body: (
      <p>
        Le fil d&apos;Ariane montre le chemin actif. Utilisez <IconFolderEdit className='inline-icon' /> pour renommer
        (si autorisé) et <IconSubfolders className='inline-icon' /> pour inclure ou masquer les éléments des
        sous-dossiers.
      </p>
    )
  },
  search: {
    title: 'Recherche et filtres',
    body: (
      <p>
        Les puces de type restreignent la liste aux schémas, modèles ou OSS. Basculez Métadonnées (
        <IconSearch className='inline-icon' />) et Recherche contextuelle (<IconText className='inline-icon' />) avec le
        sélecteur de mode ; filtrez éventuellement par propriétaire. <IconFilterReset className='inline-icon' /> efface
        les filtres personnalisés.
      </p>
    )
  },
  table: {
    title: 'Tableau des éléments',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Cliquez sur une ligne pour ouvrir un élément. Ctrl/Cmd+clic l&apos;ouvre dans un nouvel onglet. Triez avec les
          en-têtes <IconSortAsc className='inline-icon' /> et exportez le tableau visible avec{' '}
          <IconDownload className='inline-icon' />.
        </p>
        <p>
          La couleur de ligne indique le type : vert pour les OSS, orange pour les modèles conceptuels, le reste pour
          les schémas.
        </p>
      </div>
    )
  }
};
