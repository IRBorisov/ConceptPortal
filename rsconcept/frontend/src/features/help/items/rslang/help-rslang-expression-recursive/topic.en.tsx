import { useTx } from '@/i18n';

export function HelpRSLangExpressionRecursiveEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.recursive')}</h1>
      <p>The cyclic (recursive) construct is a set-theoretic expression.</p>

      <h2>Syntax</h2>
      <ul>
        <li>
          <code>{'R{ξ ≔ STE1 | STE2(ξ)}'}</code>
        </li>
        <li>
          <code>{'R{ξ ≔ STE1 | LE(ξ) | STE2(ξ)}'}</code>
        </li>
        <li>
          <code>{'R{(ξ,σ) ≔ (STE1,STE2) | LE(ξ,σ) | STE3(ξ,σ)}'}</code>
        </li>
        <li>
          The letter <code>R</code> is part of the syntax, not an identifier.
        </li>
      </ul>

      <h2>Construct components</h2>
      <ul>
        <li>
          <b>Recursion base</b> — in the first block, the assignment operator <code>≔</code> sets the initial value of
          the recursion variable (or tuple of variables).
        </li>
        <li>
          <b>Continuation condition</b> — the second block contains a logical expression <code>LE</code> that is
          re-evaluated at each step for the current value of the recursion variable. The second block is optional; by
          default the exit condition is that the value stabilises (current step equals previous step).
        </li>
        <li>
          <b>Recomputation</b> — the third block specifies the STE computed on the current value of the variable,
          yielding the value of the variable on the next step.
        </li>
      </ul>

      <h2>Step execution order</h2>
      <p>At each step the continuation condition is evaluated first, then the recomputation is performed.</p>

      <h2>Termination and result</h2>
      <p>
        Recursion continues while the continuation condition is true, or until the recursion variable stabilises (the
        value at step <i>k</i> equals the value at step <i>k+1</i>). The result is the final value of the recursion
        variable (or tuple of variables).
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        Computing powers of two:
        <br />
        <code>{'R{(ξ,σ) ≔ (1, 0) | σ<5 | (2∗ξ, σ+1)} = 32'}</code>
      </p>
    </>
  );
}
