import { useTx } from '@/i18n';

export function HelpRSLangExpressionLogicFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.logic')}</h1>
      <p>
        Les formules propositionnelles dans RSLang sont des expressions logiques construites
        à partir de prédicats (expressions logiques) et de variables à l'aide de connecteurs. Les constantes VRAI et
        FAUX ne sont pas utilisées dans l'explication des schémas conceptuels.
      </p>

      <h2>Prédicats ensemblistes</h2>
      <ul>
        <li>
          <b>Appartenance</b> : <code>ξ∈S</code> — l'élément ξ appartient à l'ensemble S.
        </li>
        <li>
          <b>Non-appartenance</b> : <code>ξ∉S</code> — l'élément ξ n'appartient pas à l'ensemble S.
        </li>
        <li>
          <b>Égalité d'ensembles</b> : <code>S1=S2</code>.
        </li>
        <li>
          <b>Inégalité d'ensembles</b> : <code>S1≠S2</code>.
        </li>
        <li>
          <b>Inclusion</b> : <code>S1⊆S2</code> — S₁ est un sous-ensemble de S₂.
        </li>
        <li>
          <b>Inclusion stricte</b> : <code>S1⊂S2</code>.
        </li>
        <li>
          <b>Non-inclusion</b> : <code>S1⊄S2</code>.
        </li>
      </ul>

      <h2>Prédicats arithmétiques</h2>
      <ul>
        <li>
          <b>Égalité</b> : <code>2 = 4</code>.
        </li>
        <li>
          <b>Inégalité</b> : <code>2 ≠ 4</code>.
        </li>
        <li>
          <b>Inférieur</b> : <code>2 &lt; 4</code>.
        </li>
        <li>
          <b>Inférieur ou égal</b> : <code>2 ≤ 4</code>.
        </li>
        <li>
          <b>Supérieur</b> : <code>2 &gt; 4</code>.
        </li>
        <li>
          <b>Supérieur ou égal</b> : <code>2 ≥ 4</code>.
        </li>
      </ul>

      <h2>Connecteurs logiques</h2>
      <ul>
        <li>
          <b>Négation</b> : <code>¬A</code> — vrai si et seulement si A est faux.
        </li>
        <li>
          <b>Conjonction</b> : <code>A & B</code> — vrai si A et B sont tous deux vrais.
        </li>
        <li>
          <b>Disjonction</b> : <code>A ∨ B</code> — vrai si au moins l'un de A ou B est vrai.
        </li>
        <li>
          <b>Implication</b> : <code>A ⇒ B</code> — vrai si A implique B (faux uniquement quand A est vrai et B est
          faux).
        </li>
        <li>
          <b>Équivalence</b> : <code>A ⇔ B</code> — vrai si A et B ont la même valeur de vérité.
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
