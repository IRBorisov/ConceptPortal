import { useTx } from '@/i18n';

export function HelpRSLangExpressionLogicEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.logic')}</h1>
      <p>
        Propositional formulas in the genus-structure language are logical expressions built from predicates (logical
        expressions) and variables using connectives. The constants TRUE and FALSE are not used in the explication of
        conceptual schemas.
      </p>

      <h2>Set-theoretic predicates</h2>
      <ul>
        <li>
          <b>Membership</b>: <code>ξ∈S</code> — element ξ belongs to set S.
        </li>
        <li>
          <b>Non-membership</b>: <code>ξ∉S</code> — element ξ does not belong to set S.
        </li>
        <li>
          <b>Set equality</b>: <code>S1=S2</code>.
        </li>
        <li>
          <b>Set inequality</b>: <code>S1≠S2</code>.
        </li>
        <li>
          <b>Inclusion</b>: <code>S1⊆S2</code> — S₁ is a subset of S₂.
        </li>
        <li>
          <b>Strict inclusion</b>: <code>S1⊂S2</code>.
        </li>
        <li>
          <b>Non-inclusion</b>: <code>S1⊄S2</code>.
        </li>
      </ul>

      <h2>Arithmetic predicates</h2>
      <ul>
        <li>
          <b>Equality</b>: <code>2 = 4</code>.
        </li>
        <li>
          <b>Inequality</b>: <code>2 ≠ 4</code>.
        </li>
        <li>
          <b>Less than</b>: <code>2 &lt; 4</code>.
        </li>
        <li>
          <b>Less than or equal</b>: <code>2 ≤ 4</code>.
        </li>
        <li>
          <b>Greater than</b>: <code>2 &gt; 4</code>.
        </li>
        <li>
          <b>Greater than or equal</b>: <code>2 ≥ 4</code>.
        </li>
      </ul>

      <h2>Logical connectives</h2>
      <ul>
        <li>
          <b>Negation</b>: <code>¬A</code> — true if and only if A is false.
        </li>
        <li>
          <b>Conjunction</b>: <code>A & B</code> — true if both A and B are true.
        </li>
        <li>
          <b>Disjunction</b>: <code>A ∨ B</code> — true if at least one of A or B is true.
        </li>
        <li>
          <b>Implication</b>: <code>A ⇒ B</code> — true if A implies B (false only when A is true and B is false).
        </li>
        <li>
          <b>Equivalence</b>: <code>A ⇔ B</code> — true if A and B have the same truth value.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>¬α∈S1</code>
        </li>
        <li>
          <code>D1∈S1 ⇒ 2+2=5</code>
        </li>
        <li>
          <code>{`D1⊆D2 ⇔ ∀x∈D1 x∈D2`}</code>
        </li>
      </ul>
    </>
  );
}
