import { useTx } from '@/i18n';

export function HelpRSLangTypificationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.typification')}</h1>
      <ul>
        Une expression en genres de structures <code>ξ</code> possède une typification (structure) si ξ∈H,
        <br />
        où <code>H</code> est une expression de <b>grade</b> correcte définie par les règles suivantes :
        <li>
          <code>Xi, Ci</code> — un grade appelé <b>élément</b> ;
        </li>
        <li>
          Z — un grade appelé <b>entier</b> ;
        </li>
        <li>
          <code>(H1×...×Hn)</code> — un grade appelé <b>tuple d'arité n</b> ;
        </li>
        <li>
          <code>ℬ(H)</code> — un grade appelé <b>ensemble</b>.
        </li>
      </ul>
      <p>L'ensemble vide ∅ a la typification ℬ(R0) — un ensemble avec une structure d'élément arbitraire.</p>
      <p>
        Pour généraliser la notion de typification aux expressions logiques et paramétrées, un certain nombre de
        notations supplémentaires sont introduites.
      </p>
      <p>
        Les expressions logiques (axiomes, théorèmes) prenant les valeurs VRAI ou FAUX appartiennent à la typification{' '}
        <b>Logic</b>.
      </p>
      <p>
        Les expressions paramétrées (fonctions-terme, fonctions-prédicat) appartiennent à la typification <br />
        <code>Hr 🠔 [H1, H2,...Hi]</code>,
        <br />
        où <code>Hr</code> est la typification du résultat et <code>H1,...Hi</code> sont les typifications des
        arguments.
      </p>
      <p></p>
      <p>
        Les expressions paramétrées modèles peuvent contenir des notations <code>R1,...Ri</code>, correspondant à des
        grades arbitraires déterminés à partir des typifications des arguments au point d'utilisation.
      </p>
    </>
  );
}
