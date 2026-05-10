import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAdmin,
  IconAlert,
  IconCalculateAll,
  IconClone,
  IconDestroy,
  IconEditor,
  IconLibrary,
  IconMenu,
  IconOwner,
  IconQR,
  IconReader,
  IconRSForm,
  IconSandbox,
  IconShare
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelMenuFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.edit')}</h1>
      <p>
        Lors de la navigation vers un modèle conceptuel individuel, le menu du modèle et un ensemble d'onglets
        apparaissent en haut pour consulter les attributs, le contenu et les données. Les commandes disponibles dépendent
        des droits de l'utilisateur, du mode d'accès et de l'état du modèle.
      </p>

      <p>
        Certaines actions peuvent être indisponibles en mode anonyme ou en l'absence de droits de modification.
      </p>

      <h2>{tx('tx.general.tab.plural')}</h2>
      <ul>
        <li>
          <LinkTopic text='Passeport' topic={HelpTopic.UI_MODEL_CARD} /> - attributs du modèle et lien avec le schéma
          conceptuel
        </li>
        <li>
          <LinkTopic text='Liste' topic={HelpTopic.UI_MODEL_LIST} /> - travail tabulaire avec les constituants du modèle
        </li>
        <li>
          <LinkTopic text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – modifier un{' '}
          <LinkTopic text='Constituant' topic={HelpTopic.CC_CONSTITUENTA} /> individuel
        </li>
        <li>
          <LinkTopic text='Graphe' topic={HelpTopic.UI_GRAPH_TERM} /> – vue graphique des relations entre constituants
        </li>
        <li>
          <LinkTopic text='Données' topic={HelpTopic.UI_MODEL_VALUE} /> - saisie, consultation et modification des
          valeurs du modèle
        </li>
        <li>
          <LinkTopic text='Évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> - vérifier et calculer des expressions
          arbitraires
        </li>
      </ul>

      <div className='flex my-3'>
        <div>
          <h2>{tx('tx.model.menu')}</h2>
          <ul>
            <li>
              <IconMenu size='1.25rem' className='inline-icon' /> Menu du modèle - menu déroulant avec les fonctions
              générales
            </li>
            <li>
              <IconCalculateAll className='inline-icon icon-green' /> Recalculer le modèle - recalcul de tous les calculs
            </li>
            <li>
              <IconShare className='inline-icon icon-primary' /> Partager - copier le lien public du modèle
            </li>
            <li>
              <IconQR className='inline-icon icon-primary' /> QR code - afficher le QR code de la page du modèle
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Cloner - créer une copie du modèle
            </li>
            <li>
              <IconSandbox className='inline-icon icon-green' /> Ouvrir dans le bac à sable - dupliquer le modèle dans
              le bac à sable
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> Supprimer le modèle - supprimer le modèle de la
              bibliothèque
            </li>
            <li>
              <IconRSForm className='inline-icon icon-primary' /> Aller au schéma - accéder au schéma conceptuel
            </li>
            <li>
              <IconLibrary className='inline-icon icon-primary' /> Bibliothèque - accéder à la bibliothèque
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
    </>
  );
}
