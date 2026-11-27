import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        Relativization changes the perspective on an individual entity, the <b>relativization focus</b>. It treats the
        entity as a collection of entities of the same kind. Each member of the collection provides a context for
        dependent concepts and statements.
      </p>
      <p>
        Enter a <b>family name</b> to capture the new perspective. The Portal suggests it as the term for the set of
        contexts in the resulting <LinkTopic text='conceptual schema' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        The Portal applies an outer <LinkTopic text='power-set operator' topic={HelpTopic.RSL_TYPIFICATION} /> to the
        focus’s domain to form the <b>set of contexts</b>. Other{' '}
        <LinkTopic text='undefined concepts' topic={HelpTopic.CC_CONSTITUENTA} /> in the source schema can be related to
        this set or excluded from relativization.
      </p>
      <p>
        The Portal rewrites the formulas of statements and derived concepts that depend on the focus or on relativized
        undefined concepts. These formulas use concept values from the current context. Dependent terms become families
        of pairs “context, value”. Functions and predicates take the context as their first argument. Axioms and
        statements are checked in all admissible contexts.
      </p>
      <p>
        In <LinkTopic text='formal definitions' topic={HelpTopic.CC_CONSTITUENTA} />, the Portal uses a helper function
        called a <b>derelativizer</b>. It extracts the unique value for a given context from a relativized constituent.
      </p>
      <h2>Editing an operation in an OSS</h2>
      <p>
        On the <LinkTopic text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} />, right-click the relativization node and
        choose “{tx('tx.general.edit')}”. The dialog shows the source schema and the saved operation parameters.
      </p>
      <ul>
        <li>
          In “{tx('tx.oss.relativization.target.focus')}”, you can choose a{' '}
          <LinkTopic text='base set or generic structure' topic={HelpTopic.CC_CONSTITUENTA} />. Fill in the required “
          {tx('tx.oss.relativization.review.context.name')}” field.
        </li>
        <li>Under “{tx('tx.oss.relativization.excluded')}”, select concepts shared by all contexts.</li>
        <li>
          Under “{tx('tx.oss.relativization.result')}”, enter a title and an alias that is unique within the OSS. You
          can also change the description and choose a parent block if the OSS has blocks.
        </li>
      </ul>
      <h3>Saving the result</h3>
      <ul>
        <li>
          “{tx('tx.oss.relativization.quick.update')}” applies the parameters immediately. The Portal uses previously
          confirmed texts for the corresponding constituents and generates the remaining texts.
        </li>
        <li>
          “{tx('tx.oss.relativization.review.start')}” opens a draft. Open the rows marked “
          {tx('tx.oss.relativization.review.required')}” and compare the texts before and after transformation. Edit the{' '}
          <LinkTopic text='terms, textual definitions, and conventions' topic={HelpTopic.CC_CONSTITUENTA} /> as needed.
          Fill in the highlighted fields and confirm the clarifications. Select “
          {tx('tx.oss.relativization.review.update')}” to save the texts and parameters.
        </li>
      </ul>
      <p>
        You may see “{tx('tx.oss.relativization.review.conflict')}” when the Portal recalculates a draft, for example
        after a change to the family name. This happens when the new suggested text differs from a previously confirmed
        version or from your unsaved edit. You also need to choose when the saved text changed while you were working
        and now differs from your edit. Select the version to use.
      </p>
      <p>
        If the source schema changes during review, select “{tx('tx.oss.relativization.review.back')}” and start the
        text review again.
      </p>
      <p>
        When you select “{tx('tx.oss.relativization.quick.update')}” or “{tx('tx.oss.relativization.review.update')}”,
        the Portal recalculates the result schema and checks the transformed formulas. Once the save succeeds, the
        Portal opens the schema.
      </p>
    </>
  );
}
