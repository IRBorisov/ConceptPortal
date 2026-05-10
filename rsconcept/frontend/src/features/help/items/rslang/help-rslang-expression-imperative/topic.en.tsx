import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionImperativeEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.imperative')}</h1>
      <p>
        The imperative construct in the genus-structure language is a set-theoretic expression built using blocks and
        computation rules.
      </p>
      <p>
        An imperative construct can be transformed into an equivalent{' '}
        <LinkTopic topic={HelpTopic.RSL_EXPRESSION_DECLARATIVE} text='declarative construct' />. It differs from the
        declarative (genus-species) definition in that it expresses definitions through a sequence of iteration and
        assignment actions.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <code>I{'{STE(ξ1, ξ2) | ξ1∶∈STE1; ξ2≔STE2; ξk∶∈STEk; LE(ξ1,ξ2); ...}'}</code>
        </li>
        <li>
          The letter <code>I</code> is part of the syntax.
        </li>
        <li>
          The left part is an expression <code>STE(ξ1, ..., ξk)</code> that forms the set's elements.
        </li>
        <li>
          The right part is a sequence of blocks separated by semicolons. Each block defines one action.
        </li>
      </ul>

      <h2>Action blocks</h2>
      <ul>
        <li>
          <b>Iteration</b>
          <code>ξ1∶∈STE1</code>
          variable <code>ξ1</code> (or a tuple of variables) iterates over the elements of the set defined by
          set-theoretic expression STE1.
        </li>
        <li>
          <b>Assignment</b>
          <code>ξ2≔STE2</code>
          variable <code>ξ2</code> (or a tuple of variables) receives the value of expression STE2.
        </li>
        <li>
          <b>Logical expression</b>. If the logical expression evaluates to false, subsequent actions are not executed
          (iteration continues).
        </li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <p>
        For each combination of values of iterated and assigned variables, the value of{' '}
        <code>STE(ξ1, ..., ξk)</code> is computed. This result is included in the final set if all logical expressions
        are true.
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        <code>
          I{'{(ξ1,ξ2) | ξ1∶∈{1, 2, 3}; ξ2≔ξ1+1; ∃σ∈{4, 5, 6} (σ=2∗ξ2)}'} = {'{(1, 2), (2, 3)}'}
        </code>
      </p>
    </>
  );
}
