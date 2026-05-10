import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAnimation,
  IconAnimationOff,
  IconChild,
  IconClone,
  IconConnect,
  IconConsolidation,
  IconCoordinates,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconGrid,
  IconImage,
  IconLeftOpen,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconNewRSForm,
  IconReference,
  IconReset,
  IconRSForm,
  IconSave,
  IconSettings
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssGraphFr() {
  const tx = useTx();
  return (
    <>
      <h1 className='sm:pr-24'>{tx('tx.oss')}</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-64'>
          <h2>Paramètres du graphe</h2>
          <ul>
            <li>
              <IconReset className='inline-icon' /> Réinitialiser les modifications
            </li>
            <li>
              <IconFitImage className='inline-icon' /> Ajuster à l'écran
            </li>
            <li>
              <IconLeftOpen className='inline-icon' /> Panneau de contenu
            </li>
            <li>
              <IconImage className='inline-icon' /> Enregistrer l'image
            </li>
            <li>
              <IconSettings className='inline-icon' /> Dialogue des paramètres
            </li>
            <li>
              <IconGrid className='inline-icon' /> Afficher la grille
            </li>
            <li>
              <IconLineWave className='inline-icon' />
              <IconLineStraight className='inline-icon' /> Type de ligne
            </li>
            <li>
              <IconAnimation className='inline-icon' />
              <IconAnimationOff className='inline-icon' /> Animation
            </li>
            <li>
              <IconCoordinates className='inline-icon' /> Afficher les coordonnées
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-76'>
          <h2>Modification des nœuds</h2>
          <ul>
            <li>
              <kbd>Clic</kbd> sur une opération — sélectionner
            </li>
            <li>
              <kbd>Échap</kbd> — désélectionner
            </li>
            <li>
              <kbd>Double-clic</kbd> — accéder au <LinkTopic text='SC' topic={HelpTopic.CC_SYSTEM} /> lié
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> Nouveau nœud
            </li>
            <li>
              <IconEdit2 className='inline-icon' /> Modifier le nœud
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> <kbd>Suppr</kbd> — supprimer la sélection
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-2' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-64'>
          <h2>Général</h2>
          <ul>
            <li>
              <IconSave className='inline-icon' /> Enregistrer les positions des nœuds
            </li>
            <li>
              <IconRSForm className='inline-icon icon-green' /> Statut du{' '}
              <LinkTopic text='SC' topic={HelpTopic.CC_SYSTEM} /> lié
            </li>
            <li>
              <IconConsolidation className='inline-icon' />{' '}
              <LinkTopic text='Synthèse en diamant' topic={HelpTopic.CC_OSS} />
            </li>
            <li>barre supérieure — opération de chargement</li>
            <li>
              barre gauche — SC <LinkTopic text='externe' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <kbd>Espace</kbd> — déplacer le canvas
            </li>
            <li>
              <kbd>Maj</kbd> — étendre la sélection
            </li>
            <li>
              <kbd>Flèches</kbd> — naviguer dans la sélection
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-76'>
          <h2>Menu contextuel</h2>
          <ul>
            <li>
              <IconNewRSForm className='inline-icon icon-green' /> Créer un SC vide pour le chargement
            </li>
            <li>
              <IconConnect className='inline-icon' /> Attribuer un SC pour le chargement
            </li>
            <li>
              <IconChild className='inline-icon icon-green' />{' '}
              <LinkTopic text='Déplacer des constituants' topic={HelpTopic.UI_RELOCATE_CST} />
            </li>
            <li>
              <IconExecute className='inline-icon icon-green' /> Activer l'opération
            </li>
            <li>
              <IconReference className='inline-icon icon-green' /> Créer une réplique
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Cloner le SC et charger
            </li>
            <li>
              <IconRSForm className='inline-icon' /> Ouvrir le SC lié
            </li>
            <li>
              <IconReference className='inline-icon' /> Sélectionner l'original de la réplique
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
