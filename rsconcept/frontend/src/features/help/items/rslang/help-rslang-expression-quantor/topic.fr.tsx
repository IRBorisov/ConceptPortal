import { useTx } from '@/i18n';

export function HelpRSLangExpressionQuantorFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.quantifier')}</h1>
      <p>
        Les expressions quantifiées dans RSLang sont utilisées pour formuler des assertions
        sur tous les éléments ou certains éléments d'un ensemble.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <b>Universel</b> : <code>∀ξ∈EE (EL(ξ))</code>
        </li>
        <li>
          <b>Existentiel</b> : <code>∃ξ∈EE (EL(ξ))</code>
        </li>
        <li>
          <code>∀(ξ1, ξ2)∈EE (EL(ξ1, ξ2))</code>
        </li>
        <li>
          <code>∀ξ1,ξ2∈EE (EL(ξ1, ξ2))</code>
        </li>
        <li>Les parenthèses autour de EL peuvent être omises pour les expressions logiques atomiques.</li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <ul>
        <li>
          <b>Universel</b> : l'expression est vraie si la condition <code>EL(ξ)</code> est vérifiée pour toutes les
          valeurs de <code>ξ</code> dans le domaine.
        </li>
        <li>
          <b>Existentiel</b> : l'expression est vraie s'il existe au moins une valeur de <code>ξ</code> dans le
          domaine pour laquelle <code>EL(ξ)</code> est vérifiée.
        </li>
        <li>
          Un tuple de variables signifie la déclaration d'une variable parcourant des valeurs et l'introduction de
          notations pour ses projections.
        </li>
        <li>
          Une liste de variables est un raccourci pour des quantificateurs imbriqués du même type sur le même domaine.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>∀x∈D1 ∃y∈D2 (x,y)∈S1 & (x,x)∈S1</code>
        </li>
      </ul>
    </>
  );
}
