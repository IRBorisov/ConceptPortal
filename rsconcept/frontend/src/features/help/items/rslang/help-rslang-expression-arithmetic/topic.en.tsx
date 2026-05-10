import { useTx } from '@/i18n';

export function HelpRSLangExpressionArithmeticEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.arithmetic')}</h1>
      <p>Arithmetic expressions in the genus-structure language are intended for working with integers.</p>

      <h2>Basic operations</h2>
      <p>
        These operations form a set-theoretic expression with typification <code>Z</code> (integer).
      </p>
      <ul>
        <li>
          <b>Addition</b>: <code>a + b</code> — sum of <code>a</code> and <code>b</code>.
        </li>
        <li>
          <b>Subtraction</b>: <code>a - b</code> — difference of <code>a</code> and <code>b</code>.
        </li>
        <li>
          <b>Multiplication</b>: <code>a * b</code> — product of <code>a</code> and <code>b</code>.
        </li>
      </ul>

      <h2>Comparison operations</h2>
      <p>
        These operations form a logical expression with typification <code>Logic</code>.
      </p>
      <ul>
        <li>
          <b>Less than</b>: <code>a &lt; b</code>
        </li>
        <li>
          <b>Less than or equal</b>: <code>a ≤ b</code>
        </li>
        <li>
          <b>Greater than</b>: <code>a &gt; b</code>
        </li>
        <li>
          <b>Greater than or equal</b>: <code>a ≥ b</code>
        </li>
      </ul>

      <h2>Cardinality</h2>
      <p>
        <b>Set cardinality</b>: <code>card(X1)</code> — number of elements in set <code>X</code>. Since only finite
        sets are used in practice, cardinality is always an integer.
      </p>

      <h2>Examples</h2>
      <ul>
        <li>
          <code>(4 + 5) * 3</code>
        </li>
        <li>
          <code>card(X1) &gt; 5</code>
        </li>
        <li>
          <code>x ≤ y + 1</code>
        </li>
      </ul>
    </>
  );
}
