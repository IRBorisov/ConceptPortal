import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionStructureEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.structure')}</h1>
      <p>
        Structural expressions in the genus-structure language are used for transformations that change the{' '}
        <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='typification' /> of arguments, allowing the generation of
        structurally dependent or structurally new concepts.
      </p>

      <h2>Forming structures</h2>
      <ul>
        <li>
          <b>Boolean / Power set</b>: <code>ℬ(X1)</code> — set of all subsets of <code>X1</code>.
        </li>
        <li>
          <b>Cartesian product</b>: <code>X1×X2</code> — set of all pairs of elements from <code>X1</code> and{' '}
          <code>X2</code>.
        </li>
        <li>
          <b>Tuple</b>: <code>(a, b, c)</code> — ordered n-tuple (n ≥ 2).
        </li>
        <li>
          <b>Enumeration</b>: <code>{'{a, b, c}'}</code> — unordered n-tuple (n ≥ 1).
        </li>
        <li>
          <b>Singleton / bool</b>: <code>bool(a)</code> = <code>{`{a}`}</code> — set consisting of a single element.
        </li>
      </ul>

      <h2>Derived structures</h2>
      <ul>
        <li>
          <b>Sum set</b>: <code>red(S1)</code> — union of the elements of all sets in <code>S1</code>. Applicable only
          to sets consisting of sets.
        </li>
        <li>
          <b>Desingleton / debool</b>: <code>debool({`{a}`})</code> = <code>a</code> — extraction of the single
          element from a set. Applicable only to sets with exactly one element.
        </li>
        <li>
          <b>Small projection</b>: <code>pr1((a1, …, an))</code> = <code>a1</code>.
        </li>
        <li>
          <b>Large projection</b>: <code>Pr1(S1)</code> — set of first components of all tuples in <code>S1</code>.
        </li>
      </ul>
      <p>
        Indices on tuple operations are shown as 1 for simplicity but can be replaced by other natural numbers or a
        comma-separated sequence.
      </p>

      <h2>Multi-indices</h2>
      <p>
        Instead of a single index a <b>multi-index</b> can be used — a comma-separated sequence of natural numbers. In
        this case the projection or filter returns multiple tuple positions at once.
      </p>
      <ul>
        <li>
          <code>pr1,3((a1, a2, a3, a4)) = (a1, a3)</code>
        </li>
        <li>
          <code>Pr2,4(S1)</code> — set of pairs composed of the second and fourth components of tuples in{' '}
          <code>S1</code>.
        </li>
      </ul>

      <h2>{tx('tx.rslang.token.filter')}</h2>
      <ul>
        <li>
          <b>Filter</b>: <code>Fi1[D1](S1)</code> — subset of <code>S1</code> in which the first projection of each
          element belongs to <code>D1</code>.
        </li>
        <li>
          <b>Multi-indices</b> are applicable to filters; the number of parameters in square brackets must match the
          number of index positions.
        </li>
        <li>
          Using a multi-index with a single parameter is allowed. Then membership in the parameter of the tuple
          composed of the corresponding projections of the filtered set's elements is checked.
        </li>
        <li>
          <b>Multi-filter</b>: <code>Fi1,2[D1](S1)</code> differs from the filter with multi-index{' '}
          <code>Fi1,2[Pr1(D1), Pr2(D2)](S1)</code> in that the former checks membership in pairs from D1, while the
          latter checks against the full Cartesian product of the projections of D1.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>{`ℬ(2) = {{}, {1}, {2}, {1, 2}}`}</code>
        </li>
        <li>
          <code>(1,2,3)</code> — tuple of three numbers
        </li>
        <li>
          <code>pr2((5, 4, 3, 2, 1)) = 4</code>
        </li>
        <li>
          <code>
            Pr3({`{(1, 2, 3),(4, 5, 6)}`}) = {`{3, 6}`}
          </code>
        </li>
        <li>
          <code>
            red({`{{1, 2, 3},{3, 4}}`}) = {`{1, 2, 3, 4}`}
          </code>
        </li>
        <li>
          <code>bool(1) = {`{1}`}</code>, <code>debool({`{1}`}) = 1</code>
        </li>
        <li>
          <code>{`Fi2[{2, 4}]({((1, 2), (3, 4), (5, 6))}) = {((1, 2), (3, 4))}`}</code>
        </li>
      </ul>
    </>
  );
}
