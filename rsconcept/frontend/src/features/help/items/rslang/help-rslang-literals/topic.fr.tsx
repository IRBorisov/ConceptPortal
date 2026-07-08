import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangLiteralsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.identifiers')}</h1>
      <p>
        dans RSLang, les identifiants et les littéraux suivent des règles d'écriture
        strictes qui définissent leur rôle dans les expressions et assurent une interprétation non ambiguë.
      </p>

      <h2>Règles d'écriture des identifiants</h2>
      <ul>
        <li>
          <b>Concepts</b> — identifiants commençant par une lettre latine majuscule correspondant au type de{' '}
          <LinkTopic topic={HelpTopic.CC_CONSTITUENTA} text='constituant' /> : <code>X1</code>, <code>F11</code>,{' '}
          <code>D24</code>.
        </li>
        <li>
          <b>Radicaux</b> — notations pour des typifications arbitraires utilisées dans les{' '}
          <LinkTopic topic={HelpTopic.RSL_EXPRESSION_PARAMETER} text='expressions modèles' /> — identifiants commençant
          par la lettre R.
        </li>
        <li>
          <b>Variables</b> — identifiants commençant par une lettre grecque ou latine minuscule, par exemple :{' '}
          <code>ξ</code>, <code>μ2</code>, <code>y1</code>.
        </li>
        <li>
          <b>Identifiants spéciaux</b> — mots réservés et notations ayant une signification fixe dans le langage.
        </li>
      </ul>

      <h2>Littéraux</h2>
      <p>Les littéraux spécifient des valeurs fixes dans les expressions.</p>
      <ul>
        <li>
          <b>Entiers</b> — une séquence de chiffres. Les nombres négatifs ne sont pas pris en charge : <code>0</code>,{' '}
          <code>42</code>.
        </li>
        <li>
          <b>Ensemble des entiers</b> — le symbole <code>Z</code>.
        </li>
        <li>
          <b>Ensemble vide</b> — le symbole <code>∅</code>.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        Exemple d'utilisation d'une variable et d'un concept : <code>x ∈ X1</code>, où <code>x</code> est une variable
        et <code>X1</code> est un concept.
      </p>
      <p>
        Exemple avec des littéraux : <code>card(X1) = 5</code>.
      </p>
    </>
  );
}
