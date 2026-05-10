import { useTx } from '@/i18n';

export function HelpRSLangExpressionQuantorEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.quantifier')}</h1>
      <p>
        Quantifier expressions in the genus-structure language are used to formulate assertions about all or some
        elements of a set.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <b>Universal</b>: <code>∀ξ∈STE (LE(ξ))</code>
        </li>
        <li>
          <b>Existential</b>: <code>∃ξ∈STE (LE(ξ))</code>
        </li>
        <li>
          <code>∀(ξ1, ξ2)∈STE (LE(ξ1, ξ2))</code>
        </li>
        <li>
          <code>∀ξ1,ξ2∈STE (LE(ξ1, ξ2))</code>
        </li>
        <li>Parentheses around LE may be omitted for atomic logical expressions.</li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <ul>
        <li>
          <b>Universal</b>: the expression is true if the condition <code>LE(ξ)</code> holds for all values of{' '}
          <code>ξ</code> in the domain.
        </li>
        <li>
          <b>Existential</b>: the expression is true if there exists at least one value of <code>ξ</code> in the domain
          for which <code>LE(ξ)</code> holds.
        </li>
        <li>
          A tuple of variables means declaring a variable ranging over values and introducing notation for its
          projections.
        </li>
        <li>
          A list of variables is shorthand for nested quantifiers of the same type over the same domain.
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
