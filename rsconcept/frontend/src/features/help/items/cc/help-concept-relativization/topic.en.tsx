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
        Enter a <b>family name</b> to capture the new perspective. The Portal adds this name to the terms for the focus
        and the relativized constituents in the resulting{' '}
        <LinkTopic text='conceptual schema' topic={HelpTopic.CC_SYSTEM} />.
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
        of pairs “context, value”. Functions and predicates take the context as their first argument. Relativized axioms
        and statements are checked in all admissible contexts. If another relativized formula references such a
        condition, the Portal creates a helper predicate that checks it in the current context.
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
          {tx('tx.oss.relativization.context.name')}” field.
        </li>
        <li>Under “{tx('tx.oss.relativization.excluded')}”, select concepts shared by all contexts.</li>
        <li>
          Under “{tx('tx.oss.relativization.result')}”, enter a title and an alias that is unique within the OSS. You
          can also change the description and choose a parent block if the OSS has blocks.
        </li>
      </ul>
      <h3>Working with the result</h3>
      <p>
        Select “{tx('tx.general.save')}” to apply the parameters. The Portal recalculates the formulas and opens the
        resulting schema. After creating or saving it, check its meaning and edit terms, textual definitions, and
        conventions in the schema as needed.
      </p>
      <p>
        When changes propagate or parameters change, the OSS preserves your edits to surviving constituents. Other texts
        are recalculated. To change formal expressions of inherited constituents or generated artifacts, edit the source
        schema or the relativization parameters. When the focus is a base set, the context structure inherits from it
        and the copy of the base set is a generated artifact.
      </p>
      <p>
        The Portal rejects a source schema edit if it makes the focus invalid or introduces an error in the transformed
        definitions or types. Before deleting the focus or changing its type, choose another focus in the operation
        parameters.
      </p>
    </>
  );
}
