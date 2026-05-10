import { useTx } from '@/i18n';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelListFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.list')}</h1>
      <p>L'interface permet de travailler avec la liste des constituants du modèle.</p>
      <p>
        Pour modifier les définitions et les termes, accédez à l'
        <LinkTopic text='éditeur de constituants' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
      </p>
      <p>
        Pour travailler avec les valeurs, utilisez l'
        <LinkTopic text='onglet données du modèle' topic={HelpTopic.UI_MODEL_VALUE} />.
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconReset className='inline-icon' /> désélectionner : <kbd>ESC</kbd>
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> recalculer le modèle entier : <kbd>Alt + Q</kbd>
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + Haut/Bas</kbd> déplacer les constituants
        </li>
        <li>
          <IconCrucial className='inline-icon' /> basculer le marqueur de constituant clé
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> ajout rapide d'un nouveau constituant par type
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> créer un constituant via le dialogue
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> cloner le constituant sélectionné
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer les constituants sélectionnés
        </li>
      </ul>
    </>
  );
}
