import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconEditor,
  IconMenu,
  IconOwner,
  IconPDF,
  IconQR,
  IconReader,
  IconRSModel,
  IconSandbox,
  IconShare,
  IconUpload
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaMenuFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.edit')}</h1>
      <p>
        Lors de la navigation vers un schéma conceptuel individuel, un menu apparaît en haut contenant des boutons avec
        des menus déroulants et une série d'onglets. L'apparence et le nombre de boutons dépendent du mode d'accès
        sélectionné.
      </p>

      <h2>{tx('tx.general.tab.plural')}</h2>
      <ul>
        <li>
          <LinkTopic text='Passeport' topic={HelpTopic.UI_SCHEMA_CARD} /> – modifier les attributs du schéma et la
          version
        </li>
        <li>
          <LinkTopic text='Liste' topic={HelpTopic.UI_SCHEMA_LIST} /> – travailler avec la liste des constituants sous
          forme de tableau
        </li>
        <li>
          <LinkTopic text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – modifier un{' '}
          <LinkTopic text='Constituant' topic={HelpTopic.CC_CONSTITUENTA} /> individuel
        </li>
        <li>
          <LinkTopic text='Graphe' topic={HelpTopic.UI_GRAPH_TERM} /> – vue graphique des relations entre constituants
        </li>
      </ul>

      <div className='flex my-3'>
        <div>
          <h2>{tx('tx.schema.menu')}</h2>
          <ul>
            <li>
              <IconMenu size='1.25rem' className='inline-icon' /> Menu du schéma – menu déroulant avec les fonctions
              générales
            </li>
            <li>
              <IconShare className='inline-icon' /> Partager – copier un lien vers le schéma
            </li>
            <li>
              <IconQR className='inline-icon' /> Afficher le QR code du schéma
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Cloner – créer une copie du schéma
            </li>
            <li>
              <IconRSModel className='inline-icon icon-green' /> Créer un modèle – créer un modèle basé sur le schéma
            </li>
            <li>
              <IconSandbox className='inline-icon icon-green' /> Ouvrir dans le bac à sable – ouvrir le schéma dans
              l'éditeur de bac à sable pour des expériences locales
            </li>
            <li>
              <IconPDF className='inline-icon' /> Exporter en PDF – enregistrer au format PDF
            </li>
            <li>
              <IconDownload className='inline-icon' /> Télécharger – enregistrer au format Exteor
            </li>
            <li>
              <IconUpload className='inline-icon icon-red' /> Charger – remplacer le schéma par le contenu d'un fichier
              Exteor
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> Supprimer – supprime le schéma de la base de données du
              Portail
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' />

        <div className='w-72'>
          <h2>{tx('tx.general.role.plural')}</h2>
          <ul>
            <li>
              <IconAlert size='1.25rem' className='inline-icon icon-red' /> travail en mode anonyme. Accéder à la page
              de connexion
            </li>
            <li>
              <IconArchive size='1.25rem' className='inline-icon' /> consultation d'une version archivée. Accéder à la
              version actuelle
            </li>
            <li>
              <IconReader size='1.25rem' className='inline-icon' /> mode Lecteur
            </li>
            <li>
              <IconEditor size='1.25rem' className='inline-icon' /> mode Éditeur
            </li>
            <li>
              <IconOwner size='1.25rem' className='inline-icon' /> mode Propriétaire
            </li>
            <li>
              <IconAdmin size='1.25rem' className='inline-icon' /> mode Administrateur
            </li>
          </ul>
        </div>
      </div>

      <p>Les modes plus bas dans la liste incluent tous les droits et fonctions disponibles des modes supérieurs</p>

      <p>
        <IconEdit2 size='1.25rem' className='inline-icon icon-green' /> les opérations sur le schéma conceptuel sont
        décrites dans la{' '}
        <LinkTopic text='section Explication' topic={HelpTopic.RSL_OPERATIONS} />.
      </p>
    </>
  );
}
