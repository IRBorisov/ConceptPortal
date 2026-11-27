import { useTx } from '@/i18n';

export function HelpConceptRelativizationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        Relativization changes how an individual entity, the <b>relativization focus</b>, is viewed. It treats that
        entity as a collection of entities of the same kind. Concepts and statements that depend on it are relativized
        to each context.
      </p>
      <p>
        A user-defined <b>family name</b> is added to the terms of the source conceptual schema. In the resulting
        schema, applying an outer power-set operator to the focus’s domain gives the <b>set of contexts</b> for
        relativization. Other undefined constituents in the source schema can be related to this set or excluded from
        relativization.
      </p>
      <p>
        The formulas of statements and derived concepts that depend on the focus and on relativized undefined
        constituents are rewritten to use concept values in the current context. Dependent terms become families of
        pairs “context, value”. Functions and predicates take the context as their first argument. Axioms and statements
        are checked in all admissible contexts.
      </p>
      <p>
        A helper function called a <b>derelativizer</b> handles references to modified constituents in formal
        definitions. It extracts the unique value for a given context from a relativized constituent.
      </p>
    </>
  );
}
