import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionImperativeFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.imperative')}</h1>
      <p>
        La construction impérative dans RSLang est une expression ensembliste construite à
        l'aide de blocs et de règles de calcul.
      </p>
      <p>
        Une construction impérative peut être transformée en une{' '}
        <LinkTopic topic={HelpTopic.RSL_EXPRESSION_DECLARATIVE} text='construction déclarative' /> équivalente. Elle
        diffère de la définition déclarative (genre-espèce) en ce qu'elle exprime les définitions à travers une
        séquence d'actions d'itération et d'affectation.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <code>I{'{EE(ξ1, ξ2) | ξ1∶∈EE1; ξ2≔EE2; ξk∶∈EEk; EL(ξ1,ξ2); ...}'}</code>
        </li>
        <li>
          La lettre <code>I</code> est une partie de la syntaxe.
        </li>
        <li>
          La partie gauche est une expression <code>EE(ξ1, ..., ξk)</code> qui forme les éléments de l'ensemble.
        </li>
        <li>
          La partie droite est une séquence de blocs séparés par des points-virgules. Chaque bloc définit une action.
        </li>
      </ul>

      <h2>Blocs d'actions</h2>
      <ul>
        <li>
          <b>Itération</b>
          <code>ξ1∶∈EE1</code>
          la variable <code>ξ1</code> (ou un tuple de variables) parcourt les éléments de l'ensemble défini par
          l'expression ensembliste EE1.
        </li>
        <li>
          <b>Affectation</b>
          <code>ξ2≔EE2</code>
          la variable <code>ξ2</code> (ou un tuple de variables) reçoit la valeur de l'expression EE2.
        </li>
        <li>
          <b>Expression logique</b>. Si l'expression logique est fausse, les actions suivantes ne sont pas exécutées
          (l'itération continue).
        </li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <p>
        Pour chaque combinaison de valeurs des variables itérées et assignées, la valeur de{' '}
        <code>EE(ξ1, ..., ξk)</code> est calculée. Ce résultat est inclus dans l'ensemble final si toutes les
        expressions logiques sont vraies.
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        <code>
          I{'{(ξ1,ξ2) | ξ1∶∈{1, 2, 3}; ξ2≔ξ1+1; ∃σ∈{4, 5, 6} (σ=2∗ξ2)}'} = {'{(1, 2), (2, 3)}'}
        </code>
      </p>
    </>
  );
}
