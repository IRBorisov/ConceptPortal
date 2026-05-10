import { useTx } from '@/i18n';

export function HelpRSLangExpressionSetEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.set')}</h1>
      <p>
        Set-theoretic expressions (STE) in the genus-structure language are used to define and transform sets. Complex
        set-theoretic expression constructs are covered in individual sections of the reference.
      </p>
      <p>
        This section presents the classical operations on sets, built from membership predicates and logical connectives.
      </p>

      <h2>Basic operations</h2>
      <ul>
        <li>
          <b>Union</b>: <code>D1 ∪ D2</code> — set of elements belonging to D1 or D2.
        </li>
        <li>
          <b>Intersection</b>: <code>D1 ∩ D2</code> — set of elements belonging to both D1 and D2.
        </li>
        <li>
          <b>Difference</b>: <code>D1 \ D2</code> — set of elements in D1 but not in D2.
        </li>
        <li>
          <b>Symmetric difference</b>: <code>D1 ∆ D2</code> — set of elements belonging exclusively to D1 or
          exclusively to D2.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>{`{1,2} ∪ {2,3} = {1,2,3}`}</code>
        </li>
        <li>
          <code>{`{1,2,3} ∩ {2,3,4} = {2,3}`}</code>
        </li>
        <li>
          <code>{`{1,2,3} \\ {2} = {1,3}`}</code>
        </li>
      </ul>
    </>
  );
}
