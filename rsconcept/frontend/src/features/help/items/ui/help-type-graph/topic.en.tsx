import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpTypeGraphEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.typeGraph')}</h1>
      <p>
        A graph of relationships between the steps (types) used in an expression or{' '}
        <LinkTopic text='schema' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        Historically displayed as a multigraph (M-graph). Multiple edges are represented by listing the indices of the
        product components.
      </p>

      <h2>{tx('tx.general.notation')}</h2>

      <ul>
        <li>
          <span className='cc-sample-color bg-secondary' />
          base step
        </li>
        <li>
          <span className='cc-sample-color bg-accent-teal' />
          powerset step
        </li>
        <li>
          <span className='cc-sample-color bg-accent-orange' />
          Cartesian product step
        </li>
        <li>edges without labels indicate taking a powerset</li>
        <li>numbers on edges indicate component indices of the Cartesian product</li>
        <li>numbers on nodes indicate the count of constituents at that step</li>
        <li>the roots of the tree are the steps of base and constant sets</li>
        <li>the step of a term-function is the product of the steps of the result and arguments</li>
        <li>the step of a predicate-function is the product of the steps of its arguments</li>
      </ul>
    </>
  );
}
