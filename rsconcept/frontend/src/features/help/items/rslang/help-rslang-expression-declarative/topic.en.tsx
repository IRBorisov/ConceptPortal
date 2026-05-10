import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionDeclarativeEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.declarative')}</h1>
      <p>
        The declarative construct, also known as the bounded comprehension schema, in the genus-structure language
        defines a set through an enumerated set and a checked condition. From the perspective of concept definitions,
        such expressions define a genus-species definition.
      </p>
      <p>
        The <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='typification' /> of the construct coincides with the
        typification of the set from which elements are selected.
      </p>

      <h2>{tx('tx.general.syntax')}</h2>
      <ul>
        <li>
          <code>D{'{ξ∈STE | LE(ξ)}'}</code>
        </li>
        <li>
          <code>D{'{(ξ₁, ξ₂)∈STE | LE(ξ₁, ξ₂)}'}</code>
        </li>
        <li>
          The letter <code>D</code> is part of the syntax, not an identifier.
        </li>
      </ul>

      <h2>{tx('tx.general.semantics')}</h2>
      <p>
        Local variables iterate over their domain. If the logical expression on the right is true for the current value
        of the variable, that value (or tuple of values) is included in the result set.
      </p>

      <h2>{tx('tx.general.example')}</h2>
      <p>
        <code>
          D{'{ξ∈{1, 2, 3, 4, 5, 6} | ∃σ∈{10, 11, 12} (σ = 2 ∗ ξ)}'} = {'{5, 6}'}
        </code>
      </p>
    </>
  );
}
