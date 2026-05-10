import { useTx } from '@/i18n';

import { IconMoveDown, IconMoveUp, IconOSS, IconPredecessor } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRelocateCstFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relocate')}</h1>
      <p>
        Le déplacement de constituants est une opération par laquelle les constituants sélectionnés sont transférés du
        SC actuel (source) vers un autre SC (cible) au sein du même{' '}
        <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='schéma opérationnel de synthèse' topic={HelpTopic.CC_OSS} />.
      </p>
      <ul>
        <li>
          applicable uniquement aux{' '}
          <IconPredecessor size='1rem' className='inline-icon' /> constituants propres de la source
        </li>
        <li>
          <IconMoveUp size='1rem' className='inline-icon' />
          <IconMoveDown size='1rem' className='inline-icon' /> direction du transfert — vers le haut ou vers le bas dans
          l'arbre de synthèse
        </li>
      </ul>

      <h2>Déplacement vers le haut</h2>
      <ul>
        <li>
          les constituants sélectionnés deviennent hérités ; leurs copies sont ajoutées au SC cible
        </li>
        <li>
          les constituants dépendant de constituants d'autres schémas conceptuels ne peuvent pas être sélectionnés
        </li>
      </ul>

      <h2>Déplacement vers le bas</h2>
      <ul>
        <li>
          les constituants sélectionnés deviennent des constituants propres du SC cible ; ils sont supprimés du SC
          source et de ses successeurs
        </li>
      </ul>
    </>
  );
}
