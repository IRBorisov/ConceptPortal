import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        Relativization transforms a conceptual schema so that concepts have values and conditions are checked in
        context.
      </p>
      <h2>Contexts and values</h2>
      <ul>
        <li>
          The <b>relativization target</b> determines what counts as one context. For a base set <code>X#</code>, a
          context is a subset of its elements. For a generic structure <code>S#</code>, a context is one whole value of
          that structure.
        </li>
        <li>
          The <b>context axis</b> is a generic structure in the result that contains the admissible contexts.
        </li>
        <li>
          An <b>excluded constituent</b> is an undefined concept that remains shared across contexts.
        </li>
        <li>
          A <b>family of term values</b> is a set of pairs consisting of a context and the term’s value in that context.
          A set-valued term puts the entire set in the second component of each pair.
        </li>
        <li>
          A <b>derelativizer</b> is a function the Portal adds when needed. It extracts the unique value for a given
          context from a family or relation indexed by context.
        </li>
      </ul>
      <p>
        For example, let <code>X1</code> be a set of vertices and let <code>D1 := X1</code> return all vertices. If the
        admissible contexts are <code>{'{a, b}'}</code> and <code>{'{b, d}'}</code>, the family contains{' '}
        <code>{'({a, b}, {a, b})'}</code> and <code>{'({b, d}, {b, d})'}</code>.
      </p>
      <h2>How to relativize a schema</h2>
      <ol>
        <li>
          For a standalone result, open “{tx('tx.general.editing')}” in the{' '}
          <LinkTopic text='source schema' topic={HelpTopic.UI_SCHEMA_MENU} />. For a linked result, open “Add…” on the{' '}
          <LinkTopic text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} />. Choose “{tx('tx.oss.relativization')}”.
        </li>
        <li>
          In an OSS, select the source schema. Choose the target and any exclusions. Set the name for an individual
          context, the proposal language, and the title and alias of the result.
        </li>
        <li>
          Choose “{tx('tx.oss.relativization.review.start')}”. Open each kernel proposal and check its term, textual
          definition, convention and type. Resolve the flagged questions and confirm creation.
        </li>
      </ol>
      <h2>What happens to the result</h2>
      <p>
        A standalone result is based on a snapshot of the source schema. In an OSS, edits to the source update the
        result, which can serve as an input to later synthesis. The Portal rejects edits that remove the selected target
        or cause the transformation to produce an unevaluable family.
      </p>
      <p>
        See the <LinkTopic text='glossary' topic={HelpTopic.THESAURUS} /> and the{' '}
        <LinkTopic text='operational synthesis schema' topic={HelpTopic.CC_OSS} />.
      </p>
    </>
  );
}
