import { useTx } from '@/i18n';

export function HelpRSLangExpressionArithmeticFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.arithmetic')}</h1>
      <p>Les expressions arithmétiques du langage des genres de structures sont destinées au travail avec les entiers.</p>

      <h2>Opérations de base</h2>
      <p>
        Ces opérations forment une expression ensembliste avec la typification <code>Z</code> (entier).
      </p>
      <ul>
        <li>
          <b>Addition</b> : <code>a + b</code> — somme de <code>a</code> et <code>b</code>.
        </li>
        <li>
          <b>Soustraction</b> : <code>a - b</code> — différence de <code>a</code> et <code>b</code>.
        </li>
        <li>
          <b>Multiplication</b> : <code>a * b</code> — produit de <code>a</code> et <code>b</code>.
        </li>
      </ul>

      <h2>Opérations de comparaison</h2>
      <p>
        Ces opérations forment une expression logique avec la typification <code>Logic</code>.
      </p>
      <ul>
        <li>
          <b>Inférieur</b> : <code>a &lt; b</code>
        </li>
        <li>
          <b>Inférieur ou égal</b> : <code>a ≤ b</code>
        </li>
        <li>
          <b>Supérieur</b> : <code>a &gt; b</code>
        </li>
        <li>
          <b>Supérieur ou égal</b> : <code>a ≥ b</code>
        </li>
      </ul>

      <h2>Cardinalité</h2>
      <p>
        <b>Cardinalité d'un ensemble</b> : <code>card(X1)</code> — nombre d'éléments de l'ensemble <code>X</code>.
        Puisque seuls des ensembles finis sont utilisés en pratique, la cardinalité est toujours un entier.
      </p>

      <h2>Exemples</h2>
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
