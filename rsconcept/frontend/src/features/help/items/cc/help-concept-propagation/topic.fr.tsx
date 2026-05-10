import { useTx } from '@/i18n';

import { IconPredecessor } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptPropagationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.change.propagation')}</h1>
      <p>
        Le Portail prend en charge les <b>modifications propagées</b> au sein d'un{' '}
        <LinkTopic text='SOS' topic={HelpTopic.CC_OSS} />. Les modifications apportées aux schémas conceptuels sources
        sont automatiquement propagées dans le graphe de synthèse (par mise à jour des constituants hérités). Les
        définitions formelles et les conventions des constituants hérités ne peuvent être modifiées qu'en modifiant{' '}
        <span className='text-nowrap'>
          <IconPredecessor className='inline-icon' /> <b>les constituants sources</b>.
        </span>
      </p>
      <p>
        Les modifications au niveau du schéma conceptuel (ajout, suppression ou modification de constituants) entraînent
        la création, la suppression ou la mise à jour automatique des constituants hérités. Si des constituants supprimés
        figurent dans le tableau d'identification d'une opération, ces identifications{' '}
        <u>seront automatiquement annulées</u>.
      </p>
      <p>
        Après une annulation, les références au constituant recréé dans les constituants propres du schéma synthétisé ne
        sont pas mises à jour.
      </p>
      <p>
        La suppression d'un schéma conceptuel lié à une opération provoque la suppression automatique de tous les
        constituants hérités. Il est possible par la suite de ré-exécuter l'opération de chargement ainsi que la
        synthèse. Cependant, les constituants ajoutés manuellement et les identifications annulées{' '}
        <u>ne seront pas restaurés</u>.
      </p>
      <p>
        Lorsque les arguments d'une opération de synthèse sont modifiés en présence d'un schéma lié, les constituants
        correspondants des arguments sont automatiquement ajoutés ou supprimés. Les tableaux d'identification sont
        ajustés en conséquence pour ne pas référencer les constituants supprimés.
      </p>
      <p>
        La suppression d'une opération de chargement est possible sans restriction. La suppression d'une opération de
        Synthèse n'est possible que si celle-ci n'est pas un argument d'une autre opération. Lors de la suppression
        d'une opération, vous pouvez choisir l'option « supprimer le schéma » pour retirer le schéma conceptuel de la
        base de données du Portail. Vous pouvez également choisir « conserver les constituants », ce qui transforme les
        constituants hérités dans les opérations situées en aval en constituants sources.
      </p>
    </>
  );
}
