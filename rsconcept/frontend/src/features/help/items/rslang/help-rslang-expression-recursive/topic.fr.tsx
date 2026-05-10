import { useTx } from '@/i18n';

export function HelpRSLangExpressionRecursiveFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.recursive')}</h1>
      <p>La construction cyclique (récursive) est une expression ensembliste.</p>

      <h2>Syntaxe</h2>
      <ul>
        <li>
          <code>{'R{ξ ≔ EE1 | EE2(ξ)}'}</code>
        </li>
        <li>
          <code>{'R{ξ ≔ EE1 | EL(ξ) | EE2(ξ)}'}</code>
        </li>
        <li>
          <code>{'R{(ξ,σ) ≔ (EE1,EE2) | EL(ξ,σ) | EE3(ξ,σ)}'}</code>
        </li>
        <li>
          La lettre <code>R</code> est une partie de la syntaxe, pas un identifiant.
        </li>
      </ul>

      <h2>Composants de la construction</h2>
      <ul>
        <li>
          <b>Base de la récursion</b> — dans le premier bloc, l'opérateur d'affectation <code>≔</code> fixe la valeur
          initiale de la variable de récursion (ou du tuple de variables).
        </li>
        <li>
          <b>Condition de continuation</b> — le deuxième bloc contient une expression logique <code>EL</code>
          réévaluée à chaque étape pour la valeur courante de la variable de récursion. Le deuxième bloc est optionnel ;
          par défaut la condition de sortie est la stabilisation de la valeur (l'étape courante égale l'étape
          précédente).
        </li>
        <li>
          <b>Recalcul</b> — le troisième bloc spécifie l'EE calculée sur la valeur courante de la variable, donnant la
          valeur de la variable à l'étape suivante.
        </li>
      </ul>

      <h2>Ordre d'exécution d'une étape</h2>
      <p>À chaque étape, la condition de continuation est évaluée en premier, puis le recalcul est effectué.</p>

      <h2>Terminaison et résultat</h2>
      <p>
        La récursion continue tant que la condition de continuation est vraie, ou jusqu'à la stabilisation de la
        variable de récursion (la valeur à l'étape <i>k</i> est égale à la valeur à l'étape <i>k+1</i>). Le résultat
        est la dernière valeur de la variable de récursion (ou du tuple de variables).
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        Calcul des puissances de deux :
        <br />
        <code>{'R{(ξ,σ) ≔ (1, 0) | σ<5 | (2∗ξ, σ+1)} = 32'}</code>
      </p>
    </>
  );
}
