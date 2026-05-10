import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpTypeGraphFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.typeGraph')}</h1>
      <p>
        Un graphe des relations entre les niveaux (types) utilisés dans une expression ou un{' '}
        <LinkTopic text='schéma' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        Historiquement affiché sous forme de multigraphe (M-graphe). Les arêtes multiples sont représentées par
        l'énumération des indices des composantes du produit.
      </p>

      <h2>{tx('tx.general.notation')}</h2>

      <ul>
        <li>
          <span className='cc-sample-color bg-secondary' />
          niveau de base
        </li>
        <li>
          <span className='cc-sample-color bg-accent-teal' />
          niveau ensemble des parties
        </li>
        <li>
          <span className='cc-sample-color bg-accent-orange' />
          niveau produit cartésien
        </li>
        <li>les arêtes sans étiquettes indiquent la prise de l'ensemble des parties</li>
        <li>les chiffres sur les arêtes indiquent les numéros des composantes du produit cartésien</li>
        <li>les chiffres sur les nœuds indiquent le nombre de constituants à ce niveau</li>
        <li>les racines de l'arbre sont les niveaux des ensembles de base et constants</li>
        <li>le niveau d'une terme-fonction est le produit des niveaux du résultat et des arguments</li>
        <li>le niveau d'une prédicat-fonction est le produit des niveaux de ses arguments</li>
      </ul>
    </>
  );
}
