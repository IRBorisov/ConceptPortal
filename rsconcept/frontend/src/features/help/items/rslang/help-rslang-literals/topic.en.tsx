import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangLiteralsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.identifiers')}</h1>
      <p>
        In the genus-structure language, identifiers and literals follow strict writing rules that define their role in
        expressions and ensure unambiguous interpretation.
      </p>

      <h2>Identifier writing rules</h2>
      <ul>
        <li>
          <b>Concepts</b> — identifiers beginning with an uppercase Latin letter corresponding to the type of{' '}
          <LinkTopic topic={HelpTopic.CC_CONSTITUENTA} text='constituent' />: <code>X1</code>, <code>F11</code>,{' '}
          <code>D24</code>.
        </li>
        <li>
          <b>Radicals</b> — notations for arbitrary typifications used in{' '}
          <LinkTopic topic={HelpTopic.RSL_EXPRESSION_PARAMETER} text='template expressions' /> — identifiers beginning
          with the letter R.
        </li>
        <li>
          <b>Variables</b> — identifiers beginning with a lowercase Greek or Latin letter, for example: <code>ξ</code>,{' '}
          <code>μ2</code>, <code>y1</code>.
        </li>
        <li>
          <b>Special identifiers</b> — reserved words and notations with fixed meaning in the language.
        </li>
      </ul>

      <h2>Literals</h2>
      <p>Literals specify fixed values in expressions.</p>
      <ul>
        <li>
          <b>Integers</b> — a sequence of digits. Negative numbers are not supported: <code>0</code>, <code>42</code>.
        </li>
        <li>
          <b>Set of integers</b> — the symbol <code>Z</code>.
        </li>
        <li>
          <b>Empty set</b> — the symbol <code>∅</code>.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        Example of using a variable and a concept: <code>x ∈ X1</code>, where <code>x</code> is a variable and{' '}
        <code>X1</code> is a concept.
      </p>
      <p>
        Example with literals: <code>card(X1) = 5</code>.
      </p>
    </>
  );
}
