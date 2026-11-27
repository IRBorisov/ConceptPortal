import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        Relativization lets one conceptual schema describe a family of cases. For example, you can turn a schema for one
        graph into a schema for a family of graphs. Each graph can have its own set of edges, and the same axioms must
        hold in every graph.
      </p>
      <h2>Contexts and values</h2>
      <p>
        Choose a <b>relativization target</b> to define what counts as one case, or <b>context</b>. If you select a base
        set <code>X#</code>, it remains the common set of elements, and one context is a subset of that set. If you
        select a generic structure <code>S#</code>, one context is a whole value of the structure, such as a graph’s
        entire edge relation.
      </p>
      <p>
        The result has a generic structure called the <b>context axis</b>. The Portal adds it if you selected a base
        set, or turns the selected generic structure into the axis. When you populate a conceptual model, enter the set
        of contexts for which values will be computed and conditions checked.
      </p>
      <p>
        In dependent formulas, the Portal substitutes the current context for the selected constituent. Other concepts
        are used with their values in that same context.
      </p>
      <ul>
        <li>
          For other base sets and constant sets, the Portal adds relations so that each context can have its own subset
          of the common set. Other generic structures become relations of pairs “context, structure value”.{' '}
          <b>Excluded constituents</b> keep a single value shared by all contexts.
        </li>
        <li>
          A context-dependent term becomes a <b>family of values</b>. The new formula evaluates the original term for
          each context and returns pairs “context, term value”. If the term returns a set, the entire set occupies the
          second component of the pair.
        </li>
        <li>
          Context-dependent functions and predicates take the context as their first argument. Context-dependent axioms
          and statements are quantified over all contexts.
        </li>
      </ul>
      <p>
        When a formula needs a value from a family or relation for a single context, the Portal adds a{' '}
        <b>derelativizer</b>. This function finds the unique pair with that context and returns its second component.
        The empty set is a valid value for that component.
      </p>
      <h2>A family of graphs</h2>
      <p>
        Let <code>X1</code> be the set of vertices, <code>S1</code> the set of edges, and <code>D1 := card(S1)</code>{' '}
        the number of edges. The axiom <code>D1 &gt; 0</code> requires at least one edge. Select <code>X1</code> as the
        target. A context is now a set of vertices, and you can specify edges for each set separately.
      </p>
      <p>
        Use two contexts. The set <code>{'{a, b}'}</code> has one edge <code>(a, b)</code>, and the set{' '}
        <code>{'{b, d}'}</code> has no edges. The derelativizer retrieves the edges for each context, and the term
        returns the family <code>{'{({a, b}, 1), ({b, d}, 0)}'}</code>. The resulting axiom is false because the second
        context has zero edges.
      </p>
      <h2>How to relativize a schema</h2>
      <ol>
        <li>
          For a standalone result, open “{tx('tx.general.editing')}” in the{' '}
          <LinkTopic text='source schema' topic={HelpTopic.UI_SCHEMA_MENU} />. For a linked result, open “Add…” on the{' '}
          <LinkTopic text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} />. Choose “{tx('tx.oss.relativization')}”.
        </li>
        <li>
          In an OSS, select the source schema. Choose the target and set the result title and alias. Leave the family
          name blank to use the default in the source language. To keep any concepts common across contexts, select them
          under “{tx('tx.oss.relativization.excluded')}”.
        </li>
        <li>
          Choose “{tx('tx.oss.relativization.quick.create')}” to use the generated texts. To edit them before saving,
          choose “{tx('tx.oss.relativization.review.start')}”. Review the kernel proposals, resolve the flagged
          questions and confirm creation. Portal checks the formulas in both cases.
        </li>
      </ol>
      <h2>Standalone and linked results</h2>
      <p>
        A standalone result is based on a snapshot of the source schema. In an OSS, edits to the source update the
        result, which can serve as an input to later synthesis. The Portal rejects edits that remove the selected target
        or make the transformed expressions unevaluable.
      </p>
      <p>
        See the <LinkTopic text='glossary' topic={HelpTopic.THESAURUS} /> and the{' '}
        <LinkTopic text='operational synthesis schema' topic={HelpTopic.CC_OSS} />.
      </p>
    </>
  );
}
