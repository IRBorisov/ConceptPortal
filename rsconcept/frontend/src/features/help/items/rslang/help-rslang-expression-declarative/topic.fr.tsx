import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionDeclarativeFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.declarative')}</h1>
      <p>
        La construction déclarative, également connue sous le nom de schéma de compréhension bornée, dans RSLang définit
        un ensemble à travers un ensemble énuméré et une condition vérifiée. Du point de vue des définitions de
        concepts, de telles expressions définissent une définition genre-espèce.
      </p>
      <p>
        La <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='typification' /> de la construction coïncide avec la
        typification de l'ensemble dont les éléments sont sélectionnés.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <code>D{'{ξ∈EE | EL(ξ)}'}</code>
        </li>
        <li>
          <code>D{'{(ξ₁, ξ₂)∈EE | EL(ξ₁, ξ₂)}'}</code>
        </li>
        <li>
          La lettre <code>D</code> est une partie de la syntaxe, pas un identifiant.
        </li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <p>
        Les variables locales parcourent leur domaine. Si l'expression logique à droite est vraie pour la valeur
        courante de la variable, cette valeur (ou ce tuple de valeurs) est inclus dans l'ensemble résultant.
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        <code>
          D{'{ξ∈{1, 2, 3, 4, 5, 6} | ∃σ∈{10, 11, 12} (σ = 2 ∗ ξ)}'} = {'{5, 6}'}
        </code>
      </p>
    </>
  );
}
