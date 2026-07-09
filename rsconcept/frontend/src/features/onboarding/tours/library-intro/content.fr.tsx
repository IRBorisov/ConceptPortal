import { HelpTopic } from '@/features/help';

import { IconDownload, IconFilterReset, IconFolder, IconSearch, IconSortAsc, IconSubfolders } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentFr: Record<string, TourStepContent> = {
  welcome: {
    title: 'Bibliothèque',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          La <TourHelpLink text='bibliothèque' topic={HelpTopic.UI_LIBRARY} /> permet de parcourir et d&apos;ouvrir les
          schémas conceptuels, modèles et schémas de synthèse opérationnelle stockés dans le Portail.
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
        Le fil d&apos;Ariane montre le chemin actif. Utilisez <IconFolder className='inline-icon' /> pour renommer (si
        autorisé) et <IconSubfolders className='inline-icon' /> pour inclure ou masquer les éléments des sous-dossiers.
      </p>
    )
  },
  search: {
    title: 'Recherche et filtres',
    body: (
      <p>
        Filtrez par type, basculez entre recherche métadonnées et contexte avec <IconSearch className='inline-icon' />,
        et restreignez par propriétaire. <IconFilterReset className='inline-icon' /> efface les filtres personnalisés.
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
        <p>Les lignes vertes sont des OSS ; les lignes orange sont des modèles conceptuels.</p>
      </div>
    )
  }
};
