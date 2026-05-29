import { useTx } from '@/i18n/use-tx';

import {
  IconAnimationOff,
  IconContextSelection,
  IconDownload,
  IconFilter,
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconOSS,
  IconRSModel,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders,
  IconUserSearch
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpLibraryFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.library')}</h1>
      <ul>
        <li>
          <span className='text-accent-green-foreground'>vert </span> indique les{' '}
          <IconOSS size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='schémas opérationnels de synthèse' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <span className='text-accent-orange-foreground'>orange </span> indique les{' '}
          <IconRSModel size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='modèles conceptuels' topic={HelpTopic.CC_RSMODEL} />
        </li>
        <li>
          <kbd>clic</kbd> sur une ligne pour ouvrir l'éditeur de schéma
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + clic' : 'Ctrl + clic'}</kbd> sur une ligne ouvre le schéma dans un nouvel onglet
        </li>
        <li>
          <IconShow className='inline-icon' /> les filtres d'attributs s'appliquent au clic
        </li>
        <li>
          <IconAnimationOff className='inline-icon' /> filtre par type
        </li>
        <li>
          <IconUserSearch className='inline-icon' /> filtre par utilisateur
        </li>
        <li>
          <IconFilterReset className='inline-icon' /> réinitialiser les filtres
        </li>
        <li>
          <IconSortAsc className='inline-icon' />
          <IconSortDesc className='inline-icon' /> tri par clic sur l'en-tête de colonne
        </li>
        <li>
          <IconDownload className='inline-icon' /> exporter le tableau dans un fichier
        </li>
      </ul>

      <h2>{tx('tx.general.search')}</h2>
      <ul>
        <li>
          <IconSearch className='inline-icon' /> mode Métadonnées — recherche par abréviation, titre et description de
          l'élément de bibliothèque
        </li>
        <li>
          <IconContextSelection className='inline-icon' /> mode Recherche contextuelle — recherche dans les schémas,
          modèles et OSS : termes, définitions, commentaires, opérations et blocs
        </li>
        <li>
          <IconFilter className='inline-icon' /> en mode contextuel — choix des attributs à rechercher ; tous les champs
          sont activés par défaut
        </li>
      </ul>

      <h2>{tx('tx.lib.location.explorer')}</h2>
      <ul>
        <li>
          <kbd>clic</kbd> sur un dossier pour développer l'arborescence
        </li>
        <li>
          <kbd>clic</kbd> sur une ligne pour afficher ses schémas à droite
        </li>
        <li>
          <kbd>
            {isMac()
              ? 'Cmd + clic sur un dossier copie son chemin dans le presse-papiers'
              : 'Ctrl + clic sur un dossier copie son chemin dans le presse-papiers'}
          </kbd>
        </li>
        <li>
          <kbd>clic</kbd> sur l'icône pour replier/développer les éléments imbriqués
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> renommer le dossier sélectionné
        </li>
        <li>
          <IconSubfolders className='inline-icon' /> schémas dans les sous-dossiers
        </li>
        <li>
          <IconFolderEmpty className='inline-icon text-foreground' /> dossier sans schémas
        </li>
        <li>
          <IconFolderEmpty className='inline-icon' /> dossier avec sous-dossiers sans schémas
        </li>
        <li>
          <IconFolder className='inline-icon' /> dossier sans sous-dossiers
        </li>
        <li>
          <IconFolderClosed className='inline-icon' /> dossier avec sous-dossiers et schémas
        </li>
        <li>
          <IconFolderOpened className='inline-icon icon-green' /> dossier développé
        </li>
      </ul>
    </>
  );
}
