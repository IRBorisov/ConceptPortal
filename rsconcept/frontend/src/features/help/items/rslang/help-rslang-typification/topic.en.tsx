import { useTx } from '@/i18n';

export function HelpRSLangTypificationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.typification')}</h1>
      <ul>
        A genus-structure expression <code>ξ</code> has a typification (structure) if ξ∈H holds,
        <br />
        where <code>H</code> is a valid <b>grade</b> expression defined by the following rules:
        <li>
          <code>Xi, Ci</code> — a grade called <b>element</b>;
        </li>
        <li>
          Z — a grade called <b>integer</b>;
        </li>
        <li>
          <code>(H1×...×Hn)</code> — a grade called <b>tuple of arity n</b>;
        </li>
        <li>
          <code>ℬ(H)</code> — a grade called <b>set</b>.
        </li>
      </ul>
      <p>The empty set ∅ has typification ℬ(R0) — a set with arbitrary element structure.</p>
      <p>
        To generalise the notion of typification to logical and parameterised expressions, a number of additional
        notations are introduced.
      </p>
      <p>
        Logical expressions (axioms, theorems) that take the values TRUE or FALSE belong to typification <b>Logic</b>.
      </p>
      <p>
        Parameterised expressions (term-functions, predicate-functions) belong to typification <br />
        <code>Hr 🠔 [H1, H2,...Hi]</code>,
        <br />
        where <code>Hr</code> is the typification of the result and <code>H1,...Hi</code> are the typifications of the
        arguments.
      </p>
      <p></p>
      <p>
        Template parameterised expressions may contain notations <code>R1,...Ri</code>, corresponding to arbitrary
        grades determined from the typifications of the arguments at the point of use.
      </p>
    </>
  );
}
